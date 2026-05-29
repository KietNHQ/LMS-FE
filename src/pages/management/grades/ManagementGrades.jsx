import { useState, useEffect } from "react";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { SchoolYearTermSelector, PageHeader } from "../../../components/common";
import { resolveSchoolYearId } from "../../../services/shared/schoolYearLookup";
import {
  FiAward, FiActivity, FiBookOpen, FiPlay, FiCpu,
  FiUserCheck, FiEye, FiClock, FiFileText
} from "react-icons/fi";
import { toast } from "react-toastify";
import { gradeService } from "../../../services/pages/management/grades/gradeService";
import { classesService } from "../../../services/pages/management/classes/classesService";
import { studentsService } from "../../../services/pages/management/students/studentsService";
import "./ManagementGrades.css";

export default function ManagementGrades() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Selected student for Report Card Modal
  const [activeReportCard, setActiveReportCard] = useState(null);
  const [reportCardData, setReportCardData] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // Load all classes
  useEffect(() => {
    classesService.listClasses()
      .then(res => {
        setClasses(res);
        if (res.length > 0) {
          setSelectedClassId(res[0].id.toString());
        }
      })
      .catch(console.error);
  }, []);

  // Load students & grades in class
  useEffect(() => {
    if (!selectedClassId) return;
    let isMounted = true;
    const fetchClassGrades = async () => {
      setIsLoading(true);
      try {
        const semesterValue = selectedTerm === "hk1" ? 1 : 2;
        
        // Fetch class students via dedicated endpoint
        const classStudentsRaw = await studentsService.getClassStudents(Number(selectedClassId)).catch(() => []);
        const classStudents = Array.isArray(classStudentsRaw) ? classStudentsRaw : [];

        // Map student academic records
        const resolvedStudents = await Promise.all(
          classStudents.map(async (student) => {
            try {
              // enrollmentId is the student_enrollments.id (integer) — required for grade APIs
              const enrollmentId = student.enrollmentId || student.id;
              const gpaRes = await gradeService.calculateSemesterGPA({ enrollmentId, semesterId: semesterValue }).catch(() => null);
              const classifyRes = await gradeService.classifySemester({ enrollmentId, semesterId: semesterValue }).catch(() => null);
              const schoolYearIdValue = await resolveSchoolYearId(selectedSchoolYear);
              const honorsRes = await gradeService.checkHonors({ enrollmentId, schoolYearId: schoolYearIdValue }).catch(() => null);

              const gpaValue = gpaRes?.gpa
                ? parseFloat(gpaRes.gpa.toFixed(2))
                : (gpaRes?.gpa === 0 ? 0 : null);
              const academicData = classifyRes?.data?.academic || classifyRes;
              const classification = academicData?.classification || academicData?.result || "Chưa xếp loại";
              const honorsValue = honorsRes?.data?.honors ?? honorsRes?.honors ?? "Không";

              return {
                ...student,
                gpa: gpaValue !== null ? gpaValue : "Chưa tính",
                classification,
                honors: honorsValue
              };
            } catch (err) {
              return {
                ...student,
                gpa: "Chưa tính",
                classification: "Chưa xếp loại",
                honors: "Không"
              };
            }
          })
        );

        if (isMounted) {
          setStudents(resolvedStudents);
        }
      } catch (err) {
        console.error("Failed to load class grades:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchClassGrades();
    return () => { isMounted = false; };
  }, [selectedClassId, selectedSchoolYear, selectedTerm]);

  // Load specific Report Card — fetches HK1, HK2, and Year data in one call
  const handleOpenReportCard = async (student) => {
    setActiveReportCard(student);
    setIsLoadingReport(true);
    try {
      const schoolYearId = await resolveSchoolYearId(selectedSchoolYear);
      const enrollmentId = student.enrollmentId || student.id;

      const card = await gradeService.getReportCard(enrollmentId, { schoolYearId });
      const { semester1, semester2, gpa: yearGpa } = card?.grades || {};

      const hk1Results = semester1?.results || [];
      const hk2Results = semester2?.results || [];

      // Thông tư 22: Year GPA = (HK1 + 2×HK2) / 3
      const hk1Gpa = semester1?.gpa;
      const hk2Gpa = semester2?.gpa;
      const yearGpaCalc =
        hk1Gpa != null && hk2Gpa != null
          ? (hk1Gpa + 2 * hk2Gpa) / 3
          : hk2Gpa ?? hk1Gpa;

      // Merge per-subject: HK1 average, HK2 average, Year average
      const subjectMap = {};
      hk1Results.forEach((r) => {
        subjectMap[r.subjectName] = {
          name: r.subjectName,
          hk1Average: r.averageScore,
        };
      });
      hk2Results.forEach((r) => {
        if (!subjectMap[r.subjectName]) subjectMap[r.subjectName] = { name: r.subjectName };
        subjectMap[r.subjectName].hk2Average = r.averageScore;
      });

      // Per-subject year average = (hk1 + 2*hk2) / 3 for that subject
      Object.values(subjectMap).forEach((sub) => {
        if (sub.hk1Average != null && sub.hk2Average != null) {
          sub.yearAverage = (sub.hk1Average + 2 * sub.hk2Average) / 3;
        } else {
          sub.yearAverage = sub.hk2Average ?? sub.hk1Average;
        }
      });

      const subjects = Object.values(subjectMap);

      setReportCardData({
        studentName: card?.student?.name || student.name || "—",
        className: card?.student?.class || student.className || "—",
        semester1: {
          gpa: hk1Gpa != null ? parseFloat(hk1Gpa.toFixed(2)) : null,
          classification: card?.academicClassification?.classification || "Chưa xếp loại",
          conduct: card?.conductClassification?.level || "Tốt",
        },
        semester2: {
          gpa: hk2Gpa != null ? parseFloat(hk2Gpa.toFixed(2)) : null,
          classification: card?.academicClassification?.classification || "Chưa xếp loại",
          conduct: card?.conductClassification?.level || "Tốt",
        },
        year: {
          gpa: yearGpaCalc != null ? parseFloat(yearGpaCalc.toFixed(2)) : null,
          classification: card?.academicClassification?.classification || "Chưa xếp loại",
          conduct: card?.conductClassification?.level || "Tốt",
        },
        subjects,
      });
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải học bạ. Vui lòng thử lại.");
      setReportCardData(null);
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Trigger Bulk GPA recalculation
  const handleRecalculateGPA = async () => {
    setIsCalculating(true);
    try {
      const [semesterId, schoolYearId] = await Promise.all([
        resolveSemesterId(selectedSchoolYear, selectedTerm),
        resolveSchoolYearId(selectedSchoolYear),
      ]);
      const semValue = semesterId || (selectedTerm === "hk1" ? 1 : 2);

      // Reload grades
      const resolvedStudents = await Promise.all(
        students.map(async (student) => {
          const enrollmentId = student.enrollmentId || student.id;
          const gpaRes = await gradeService.calculateSemesterGPA({ enrollmentId, semesterId: semValue }).catch(() => null);
          const gpaValue = gpaRes?.gpa ? parseFloat(gpaRes.gpa.toFixed(2)) : (gpaRes?.gpa === 0 ? 0 : student.gpa);
          return {
            ...student,
            gpa: gpaValue !== null ? gpaValue : student.gpa
          };
        })
      );
      setStudents(resolvedStudents);
      toast.success("Đã hoàn tất tính toán và đồng bộ lại điểm trung bình (GPA) toàn lớp!");
    } catch (err) {
      console.error(err);
      toast.error("Không thể kết nối máy chủ tính toán.");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="management-grades-page">
      <PageHeader 
        title="Quản Lý Học Thuật & Điểm Số"
        eyebrow="Thông tư 22/2021/TT-BGDĐT"
        actions={
          <div className="mg-filters">
            <select 
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="mg-class-select"
            >
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <SchoolYearTermSelector 
              selectedSchoolYear={selectedSchoolYear}
              selectedTerm={selectedTerm}
              onYearChange={handleYearArrow}
              onTermChange={handleTermChange}
            />
          </div>
        }
      />

      {/* Control Actions Bar */}
      <div className="mg-actions-row">
        <button 
          onClick={handleRecalculateGPA}
          disabled={isCalculating || students.length === 0}
          className="mg-btn-calc"
        >
          <FiCpu /> {isCalculating ? "Đang xử lý thuật toán..." : "Tính điểm trung bình học kỳ (ĐTBmhk)"}
        </button>
      </div>

      {/* Grid listing */}
      <div className="mg-content-box">
        {isLoading ? (
          <div className="mg-loader">
            <div className="mg-spinner" />
            <span>Đang nạp học bạ và cơ sở dữ liệu học sinh...</span>
          </div>
        ) : (
          <div className="mg-table-wrapper">
            <table className="mg-table">
              <thead>
                <tr>
                  <th>Mã số HS</th>
                  <th>Học sinh</th>
                  <th>Điểm trung bình (GPA)</th>
                  <th>Xếp loại học tập</th>
                  <th>Danh hiệu thi đua</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="mg-empty-state">Không tìm thấy học sinh nào trong lớp đã chọn.</td>
                  </tr>
                ) : (
                  students.map((student, idx) => (
                    <tr key={idx}>
                      <td className="bold">HS{student.id}</td>
                      <td className="bold">{student.name}</td>
                      <td className="gpa-cell bold">{student.gpa}</td>
                      <td>
                        <span className={`mg-pill mg-pill--${student.classification === "Tốt" ? "success" : "warning"}`}>
                          {student.classification}
                        </span>
                      </td>
                      <td className="bold text-indigo">{student.honors}</td>
                      <td className="text-center">
                        <button 
                          onClick={() => handleOpenReportCard(student)}
                          className="mg-view-btn"
                        >
                          <FiEye /> Xem Học Bạ
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REPORT CARD DIALOG MODAL */}
      {activeReportCard && (
        <div className="mg-modal-overlay" onClick={() => setActiveReportCard(null)}>
          <div className="mg-modal-container" onClick={e => e.stopPropagation()}>
            <div className="mg-modal-header">
              <div className="mgmh-left">
                <h3>Phiếu Học Bạ Điện Tử</h3>
                <span>Năm học {selectedSchoolYear}</span>
              </div>
              <button className="mg-modal-close" onClick={() => setActiveReportCard(null)}>&times;</button>
            </div>
            <div className="mg-modal-body">
              {isLoadingReport ? (
                <div className="mg-modal-loading">
                  <div className="mg-spinner" />
                  <span>Đang tải bảng điểm chi tiết...</span>
                </div>
              ) : reportCardData ? (
                <div className="mg-report-card-sheet">
                  {/* Student Specs + Period Breakdown */}
                  <div className="mg-report-specs">
                    <div className="spec-item">
                      <span className="spec-label">Họ và tên:</span>
                      <span className="spec-val">{reportCardData.studentName}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Lớp học:</span>
                      <span className="spec-val">{reportCardData.className}</span>
                    </div>
                  </div>

                  {/* Period Classification & Conduct */}
                  <div className="mg-period-details">
                    <div className="mg-period-card mg-period-card--hk1">
                      <div className="mg-period-card-title">Học kỳ 1</div>
                      <div className="mg-period-card-row">
                        <span>Xếp loại:</span>
                        <span className="bold">{reportCardData.semester1.classification}</span>
                      </div>
                      <div className="mg-period-card-row">
                        <span>Hạnh kiểm:</span>
                        <span className="bold">{reportCardData.semester1.conduct}</span>
                      </div>
                    </div>
                    <div className="mg-period-card mg-period-card--hk2">
                      <div className="mg-period-card-title">Học kỳ 2</div>
                      <div className="mg-period-card-row">
                        <span>Xếp loại:</span>
                        <span className="bold">{reportCardData.semester2.classification}</span>
                      </div>
                      <div className="mg-period-card-row">
                        <span>Hạnh kiểm:</span>
                        <span className="bold">{reportCardData.semester2.conduct}</span>
                      </div>
                    </div>
                    <div className="mg-period-card mg-period-card--year">
                      <div className="mg-period-card-title">Cả năm</div>
                      <div className="mg-period-card-row">
                        <span>Xếp loại:</span>
                        <span className="bold">{reportCardData.year.classification}</span>
                      </div>
                      <div className="mg-period-card-row">
                        <span>Hạnh kiểm:</span>
                        <span className="bold">{reportCardData.year.conduct}</span>
                      </div>
                    </div>
                  </div>

                  {/* GPA Summary Cards: HK1 → HK2 → Cả năm */}
                  <div className="mg-gpa-summary-row">
                    <GpaSummaryCard
                      label="Học kỳ 1"
                      gpa={reportCardData.semester1.gpa}
                      variant="hk1"
                    />
                    <GpaSummaryCard
                      label="Học kỳ 2"
                      gpa={reportCardData.semester2.gpa}
                      variant="hk2"
                    />
                    <GpaSummaryCard
                      label="Cả năm"
                      gpa={reportCardData.year.gpa}
                      formula="(HK1 + 2×HK2) / 3"
                      variant="year"
                    />
                  </div>

                  {/* Detailed Subjects Table */}
                  <h4 className="section-title"><FiBookOpen /> Bảng điểm chi tiết các môn học</h4>
                  <div className="mg-detail-table-wrapper">
                    <table className="mg-detail-table">
                      <thead>
                        <tr>
                          <th>Môn học</th>
                          <th className="text-center">ĐTB HKI</th>
                          <th className="text-center">ĐTB HKII</th>
                          <th className="text-center">ĐTB cả năm</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(!reportCardData.subjects || reportCardData.subjects.length === 0) ? (
                          <tr>
                            <td colSpan={4} className="mg-empty-state">Không ghi nhận điểm môn học nào.</td>
                          </tr>
                        ) : (
                          reportCardData.subjects.map((sub, i) => (
                            <tr key={i}>
                              <td className="bold">{sub.name}</td>
                              <td className="text-center">{fmtScore(sub.hk1Average)}</td>
                              <td className="text-center">{fmtScore(sub.hk2Average)}</td>
                              <td className="text-center bold success">{fmtScore(sub.yearAverage)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mg-report-footer-note">
                    <FiFileText />
                    <span>Hệ thống tự động biên dịch &amp; tính toán học bạ theo Thông tư 22/2021/TT-BGDĐT.</span>
                  </div>
                </div>
              ) : (
                <div className="mg-empty-state">Không tìm thấy dữ liệu học tập của học sinh.</div>
              )}
            </div>
            <div className="mg-modal-footer">
              <button className="mg-modal-btn primary" onClick={() => setActiveReportCard(null)}>Đóng học bạ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function fmtScore(val) {
  if (val == null) return "—";
  return parseFloat(val.toFixed(1));
}

function GpaSummaryCard({ label, gpa, classification, formula, variant }) {
  const variantColors = {
    hk1: { border: "#3b82f6", bg: "#eff6ff", labelColor: "#1d4ed8" },
    hk2: { border: "#10b981", bg: "#ecfdf5", labelColor: "#065f46" },
    year: { border: "#8b5cf6", bg: "#f5f3ff", labelColor: "#5b21b6" },
  };
  const colors = variantColors[variant] || variantColors.year;

  return (
    <div className="gpa-card" style={{ borderColor: colors.border, background: colors.bg }}>
      <span className="gpa-card-label" style={{ color: colors.labelColor }}>{label}</span>
      <span className="gpa-card-value" style={{ color: colors.border }}>
        {gpa != null ? gpa : "Chưa có điểm"}
      </span>
      <span className="gpa-card-classif">{classification}</span>
      {formula && <span className="gpa-card-formula">{formula}</span>}
    </div>
  );
}
