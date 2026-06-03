/**
 * VP Transcript Service
 * Xuất học bạ theo mẫu PL1-PL6 (Thông tư 22/2021/TT-BGDĐT)
 *
 * Các trang:
 * PL1 - Trang thông tin chung
 * PL2 - Bảng điểm theo môn học
 * PL3 - Kết quả đánh giá HK + xếp loại
 * PL4 - Hạnh kiểm, khen thưởng, kỷ luật
 * PL5 - Tổng kết năm học
 * PL6 - Bảng điểm cộng
 */

import * as XLSX from "xlsx";
import axiosClient from "../../../shared/http/axiosClient";
import { vpDisciplineService } from "./vpDisciplineService";

const getPayload = (response) => response?.data ?? response ?? {};

export const vpTranscriptService = {
  /**
   * Lấy danh sách học sinh để chọn (tìm kiếm)
   */
  searchStudents: async (keyword = "") => {
    try {
      const response = await axiosClient.get("/students", {
        params: keyword ? { search: keyword } : {},
      });
      const students = getPayload(response);
      return Array.isArray(students) ? students : [];
    } catch (err) {
      console.warn("[vpTranscriptService] searchStudents failed:", err);
      return [];
    }
  },

  /**
   * Lấy học bạ (report card) của 1 học sinh theo enrollmentId
   * Endpoint: GET /grades/report-card/:enrollmentId
   */
  getReportCard: async (enrollmentId, { semesterId, schoolYearId } = {}) => {
    const params = {
      ...(semesterId ? { semesterId } : {}),
      ...(schoolYearId ? { schoolYearId } : {}),
    };
    const response = await axiosClient.get(`/grades/report-card/${enrollmentId}`, { params });
    return getPayload(response);
  },

  /**
   * Lấy dữ liệu tổng hợp cho học bạ: điểm + hạnh kiểm + khen thưởng/kỷ luật
   * @param {number} enrollmentId
   * @param {object} opts - { schoolYearId, hk1SemesterId, hk2SemesterId }
   */
  getTranscriptData: async (enrollmentId, opts = {}) => {
    const { schoolYearId, hk1SemesterId, hk2SemesterId } = opts;

    const [reportCard, conduct] = await Promise.allSettled([
      vpTranscriptService.getReportCard(enrollmentId, { schoolYearId }),
      hk1SemesterId && hk2SemesterId
        ? vpDisciplineService.getStudentAnnualConduct(enrollmentId, hk1SemesterId, hk2SemesterId)
        : Promise.resolve(null),
    ]);

    const data = {
      reportCard: reportCard.status === "fulfilled" ? reportCard.value : null,
      conduct: conduct.status === "fulfilled" ? conduct.value : null,
    };

    return data;
  },

  /**
   * Xuất học bạ ra Excel với 6 sheet (PL1-PL6)
   * @param {object} transcriptData - dữ liệu từ getTranscriptData
   * @param {object} meta - { studentName, className, schoolYearName }
   */
  exportTranscriptExcel: (transcriptData, meta = {}) => {
    const { reportCard, conduct } = transcriptData;
    const { studentName = "HS", className = " Lop", schoolYearName = "" } = meta;

    const wb = XLSX.utils.book_new();

    // ── PL1: Thông tin chung ────────────────────────────────────────────────
    const pl1Data = [
      ["HỌC BẠ (THÔNG TƯ 22/2021/TT-BGDĐT)", ""],
      ["", ""],
      ["Họ và tên học sinh:", studentName],
      ["Lớp:", className],
      ["Năm học:", schoolYearName],
      ["", ""],
      reportCard?.student
        ? [
            "Mã học sinh:",
            reportCard.student.student_code || reportCard.student.code || "",
          ]
        : [],
      reportCard?.class
        ? ["Tên lớp:", reportCard.class.class_name || className]
        : [],
    ].filter((row) => row && row.length > 0 && row.some((v) => v != null && v !== ""));

    const wsPL1 = XLSX.utils.aoa_to_sheet(pl1Data);
    wsPL1["!cols"] = [{ wch: 35 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsPL1, "PL1_ThongTinChung");

    // ── PL2: Bảng điểm HK I, HK II, Cả năm ────────────────────────────────
    const pl2Rows = [
      [
        "STT",
        "Môn học",
        "Điểm HK I",
        "Điểm HK II",
        "Điểm Cả năm",
        "Xếp loại",
      ],
    ];

    if (reportCard?.semesters) {
      reportCard.semesters.forEach((sem) => {
        if (sem.subjects) {
          sem.subjects.forEach((subj) => {
            pl2Rows.push([
              pl2Rows.length,
              subj.subjectName || subj.subject_name || "",
              subj.hk1Score ?? subj.hk1_score ?? "",
              subj.hk2Score ?? subj.hk2_score ?? "",
              subj.yearScore ?? subj.year_score ?? "",
              subj.classification || "",
            ]);
          });
        }
      });
    }

    if (pl2Rows.length === 1) {
      pl2Rows.push(["", "Chưa có dữ liệu điểm", "", "", "", ""]);
    }

    const wsPL2 = XLSX.utils.aoa_to_sheet(pl2Rows);
    wsPL2["!cols"] = [{ wch: 5 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, wsPL2, "PL2_BangDiem");

    // ── PL3: Kết quả đánh giá HK ───────────────────────────────────────────
    const pl3Data = [
      ["KẾT QUẢ ĐÁNH GIÁ HỌC KỲ", ""],
      ["", ""],
    ];

    if (reportCard?.semesters) {
      reportCard.semesters.forEach((sem) => {
        pl3Data.push([sem.semesterName || `HK ${sem.semesterId || ""}`, ""]);
        pl3Data.push(["Điểm trung bình:", sem.averageScore ?? sem.average_score ?? ""]);
        pl3Data.push(["Xếp loại:", sem.classification || ""]);
        pl3Data.push(["", ""]);
      });
    }

    if (reportCard?.yearlyAverage != null) {
      pl3Data.push(["Điểm TB cả năm:", reportCard.yearlyAverage]);
      pl3Data.push(["Xếp loại cả năm:", reportCard.yearlyClassification || ""]);
    }

    const wsPL3 = XLSX.utils.aoa_to_sheet(pl3Data);
    wsPL3["!cols"] = [{ wch: 30 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsPL3, "PL3_KetQuaHK");

    // ── PL4: Hạnh kiểm, khen thưởng, kỷ luật ───────────────────────────────
    const pl4Rows = [
      ["HẠNH KIỂM VÀ KỶ LUẬT", ""],
      ["", ""],
    ];

    if (conduct) {
      pl4Rows.push(["Hạnh kiểm HK I:", conduct.hk1Conduct || conduct.conduct_hk1 || ""]);
      pl4Rows.push(["Hạnh kiểm HK II:", conduct.hk2Conduct || conduct.conduct_hk2 || ""]);
      pl4Rows.push(["Hạnh kiểm cả năm:", conduct.annualConduct || conduct.conduct_annual || ""]);
      pl4Rows.push(["", ""]);
    } else {
      pl4Rows.push(["Chưa có dữ liệu hạnh kiểm", ""]);
      pl4Rows.push(["", ""]);
    }

    pl4Rows.push(["Khen thưởng / Kỷ luật:", "(Xem chi tiết từ hệ thống)"]);
    pl4Rows.push(["", ""]);

    const wsPL4 = XLSX.utils.aoa_to_sheet(pl4Rows);
    wsPL4["!cols"] = [{ wch: 30 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsPL4, "PL4_HanhKiem");

    // ── PL5: Tổng kết năm học ───────────────────────────────────────────────
    const pl5Data = [
      ["TỔNG KẾT NĂM HỌC", ""],
      ["", ""],
      ["Điểm TB cả năm:", reportCard?.yearlyAverage ?? ""],
      ["Xếp loại:", reportCard?.yearlyClassification || ""],
      ["Hạnh kiểm:", conduct?.annualConduct || ""],
      ["Xếp hạng:", reportCard?.ranking || ""],
      ["", ""],
      ["Ghi chú:", ""],
    ];

    const wsPL5 = XLSX.utils.aoa_to_sheet(pl5Data);
    wsPL5["!cols"] = [{ wch: 30 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsPL5, "PL5_TongKet");

    // ── PL6: Bảng điểm cộng, chứng chỉ, giải thưởng ──────────────────────
    const pl6Data = [
      ["ĐIỂM CỘNG VÀ GIẢI THƯỞNG", ""],
      ["", ""],
      ["Điểm cộng thi đua:", ""],
      ["Chứng chỉ:", ""],
      ["Giải thưởng:", ""],
      ["", ""],
      ["Ghi chú:", ""],
    ];

    const wsPL6 = XLSX.utils.aoa_to_sheet(pl6Data);
    wsPL6["!cols"] = [{ wch: 30 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, wsPL6, "PL6_DiemCong");

    const fileName = `HocBa_${studentName.replace(/\s+/g, "_")}_${schoolYearName || "unknown"}.xlsx`;
    XLSX.writeFile(wb, fileName);
    return fileName;
  },

  /**
   * Xuất học bạ ra PDF (trigger BE endpoint)
   * Backend đã có: GET /exports/academic-record-pdf/:studentId
   * FE sử dụng blob download pattern
   */
  exportTranscriptPDF: async (enrollmentId, studentId, schoolYearId) => {
    const response = await axiosClient.get(
      `/exports/academic-record-pdf/${studentId}`,
      {
        params: { schoolYearId },
        responseType: "blob",
      }
    );

    const blob = response;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `HocBa_${studentId}_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};

export default vpTranscriptService;
