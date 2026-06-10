import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { PageHeader, EmptyState, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import Select from "../../../components/ui/Select/Select";
import {
  FiAward, FiCheckCircle, FiXCircle, FiAlertTriangle, FiChevronRight,
  FiDownload, FiEye, FiCheck, FiX, FiRotateCcw, FiChevronLeft, FiLock
} from "react-icons/fi";
import { toast } from "react-toastify";
import { useQuery, useMutation } from "@tanstack/react-query";
import { promotionService } from "../../../services/pages/management/promotion/promotionService";
import { classesService } from "../../../services/pages/management/classes/classesService";
import { resolveSemesterId, resolveSchoolYearId } from "../../../services/shared/schoolYearLookup";
import "./PromotionPage.css";

const STATUS_COLORS = {
  promoted: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300", label: "Được lên lớp" },
  already_promoted: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-300", label: "Đã lên lớp" },
  summer_training: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300", label: "Rèn luyện hè" },
  retained: { bg: "bg-red-100", text: "text-red-700", border: "border-red-300", label: "Ở lại lớp" },
  pending: { bg: "bg-gray-100", text: "text-gray-600", border: "border-gray-300", label: "Chưa đủ điều kiện" },
  graduated: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300", label: "Tốt nghiệp" },
  GRADUATED: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300", label: "Tốt nghiệp" },
};

const mapStudentData = (s) => {
  const promotionStatus = s.promotionStatus || s.status || "pending";
  const enrollmentStatus = s.enrollmentStatus || s.enrollment_status || "";
  const isCurrentEnrollment = enrollmentStatus === "active" || enrollmentStatus === "studying";
  const status =
    enrollmentStatus === "promoted"
      ? "already_promoted"
      : promotionStatus === "conditional"
        ? "summer_training"
        : promotionStatus;
  const canPromote =
    isCurrentEnrollment &&
    (s.canPromote ?? s.can_promote ?? false) &&
    promotionStatus === "promoted";
  return {
    enrollmentId: s.enrollmentId || s.enrollment_id,
    studentId: s.studentId || s.student_id,
    studentCode: s.studentCode || s.student_code,
    studentName: s.studentName || s.student_name || "",
    hk1Avg: s.hk1Avg ?? s.hk1_avg ?? null,
    hk2Avg: s.hk2Avg ?? s.hk2_avg ?? null,
    annualAvg: s.annualAvg ?? s.annual_avg ?? null,
    hk1Conduct: s.hk1Level || s.hk1_conduct || s.conduct_hk1 || "",
    hk2Conduct: s.hk2Level || s.hk2_conduct || s.conduct_hk2 || "",
    annualConduct: s.annualConductLevel || s.annual_conduct || s.conduct_annual || "",
    absentDays: s.absentDays ?? s.absent_days ?? 0,
    status,
    promotionStatus,
    enrollmentStatus,
    note: s.note || s.notes || "",
    canPromote,
    nextClass: s.nextClass || null,
  };
};

const computeNextClass = (className) => {
  if (!className) return null;
  const match = className.match(/^(\d+)(A\d+.*)$/);
  if (!match) return null;
  const grade = parseInt(match[1]);
  const suffix = match[2];
  if (grade === 12) return "Tốt nghiệp";
  return `${grade + 1}${suffix}`;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN").format(amount);
};

export default function PromotionPage() {
  const [searchParams] = useSearchParams();
  const urlClass = searchParams.get("class");
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

  const [selectedGrade, setSelectedGrade] = useState("10");
  const [selectedClass, setSelectedClass] = useState(urlClass || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [detailModal, setDetailModal] = useState(null);
  const [manualPromoteModal, setManualPromoteModal] = useState(null); // { student, reason }
  const [hk1Id, setHk1Id] = useState(null);
  const [hk2Id, setHk2Id] = useState(null);
  const [financeModal, setFinanceModal] = useState(null);
  const [rollbackModal, setRollbackModal] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (urlClass) {
      setSelectedClass(urlClass);
      const grade = urlClass.slice(0, 2);
      if (["10", "11", "12"].includes(grade)) setSelectedGrade(grade);
    }
  }, [urlClass]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedClass]);

  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      const [id1, id2] = await Promise.all([
        resolveSemesterId(selectedSchoolYear, "hk1"),
        resolveSemesterId(selectedSchoolYear, "hk2"),
      ]);
      if (!cancelled) {
        setHk1Id(id1);
        setHk2Id(id2);
      }
    };
    resolve();
    return () => { cancelled = true; };
  }, [selectedSchoolYear]);

  const { data: classesData } = useQuery({
    queryKey: ["classes-for-promotion", selectedSchoolYear, selectedGrade],
    queryFn: async () => {
      const res = await classesService.listClasses({
        schoolYearId: selectedSchoolYear,
        gradeLevelId: parseInt(selectedGrade),
      });
      return res;
    },
    staleTime: 5 * 60_000,
  });

  const classOptions = useMemo(() => {
    if (!classesData) return [];
    return classesData.map((c) => ({
      value: c.id || c.name || c.class_name || "",
      label: c.name || c.class_name || "",
      grade: String((c.grade || "").match(/\d+/)?.[0] || (c.name || "").slice(0, 2)),
      className: c.name || c.class_name || "",
    }));
  }, [classesData]);

  const filteredClassOptions = useMemo(() => {
    if (selectedGrade === "all") return classOptions;
    return classOptions.filter((c) => c.grade === selectedGrade);
  }, [classOptions, selectedGrade]);

  const selectedClassName = useMemo(() => {
    const found = classOptions.find((c) => c.value === selectedClass);
    return found?.className || "";
  }, [classOptions, selectedClass]);

  const { data: lockStatusData } = useQuery({
    queryKey: ["lock-status", selectedClass, hk1Id, hk2Id],
    queryFn: async () => {
      if (!selectedClass || !hk1Id || !hk2Id) return null;
      const res = await promotionService.getLockStatus(selectedClass, hk1Id, hk2Id);
      return res || null;
    },
    enabled: Boolean(selectedClass && hk1Id && hk2Id),
    staleTime: 60_000,
  });

  const { data: promotionData, isLoading, refetch } = useQuery({
    queryKey: ["promotion-class-summary", selectedClass, hk1Id, hk2Id],
    queryFn: async () => {
      if (!selectedClass || !hk1Id || !hk2Id) return null;
      const res = await promotionService.getClassPromotionSummary(selectedClass, hk1Id, hk2Id, 1, 100);
      return res || null;
    },
    enabled: Boolean(selectedClass && hk1Id && hk2Id),
    staleTime: 60_000,
  });

  const promoteMutation = useMutation({
    mutationFn: async ({ isGrade12 }) => {
      // Resolve string school year name to numeric ID
      let currentSyId = selectedSchoolYear;
      if (typeof currentSyId === "string" && isNaN(Number(currentSyId))) {
        currentSyId = await resolveSchoolYearId(currentSyId);
      }
      if (isGrade12) {
        return promotionService.graduateClass(selectedClass, currentSyId, hk1Id, hk2Id);
      }
      return promotionService.bulkPromote(
        selectedClass,
        currentSyId,
        hk1Id,
        hk2Id,
        Array.from(selectedStudents),
      );
    },
    onSuccess: (data) => {
      const res = data?.data || data || {};
      const count = res.graduated ?? res.results?.graduated?.length ?? res.results?.promoted?.length ?? 0;
      if (isGrade12) {
        toast.success(`Đã xét tốt nghiệp ${count} học sinh.`);
      } else {
        toast.success(`Đã lên lớp ${count} học sinh.`);
      }
      setSelectedStudents(new Set());
      setRollbackModal(false);
      refetch();
    },
    onError: () => {
      toast.error("Không thể xét lên lớp.");
    },
  });

  const rollbackMutation = useMutation({
    mutationFn: async (reason) => {
      // Resolve string school year name to numeric ID
      let syId = selectedSchoolYear;
      if (typeof syId === "string" && isNaN(Number(syId))) {
        syId = await resolveSchoolYearId(syId);
      }
      return promotionService.rollbackClass(selectedClass, syId, reason);
    },
    onSuccess: (data) => {
      toast.success(data?.data?.message || data?.message || "Đã hủy lên lớp.");
      setRollbackModal(false);
      refetch();
    },
    onError: () => {
      toast.error("Không thể hủy lên lớp.");
    },
  });

  const studentList = useMemo(() => {
    if (!promotionData?.students) return [];
    let list = promotionData.students.map((s) => {
      const mapped = mapStudentData(s);
      if (!mapped.nextClass) {
        mapped.nextClass = computeNextClass(selectedClassName);
      }
      return mapped;
    });
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter((s) =>
        s.studentName.toLowerCase().includes(term) ||
        (s.studentCode || "").toLowerCase().includes(term)
      );
    }
    return list;
  }, [promotionData, searchTerm, selectedClassName]);

  const totalPages = useMemo(() => Math.ceil(studentList.length / ITEMS_PER_PAGE) || 1, [studentList]);
  const effectivePage = Math.min(currentPage, totalPages);
  const paginatedStudents = useMemo(() => {
    const start = (effectivePage - 1) * ITEMS_PER_PAGE;
    return studentList.slice(start, start + ITEMS_PER_PAGE);
  }, [studentList, effectivePage]);

  const goPrevPage = () => setCurrentPage((prev) => Math.max(1, prev - 1));
  const goNextPage = () => setCurrentPage((prev) => Math.min(totalPages, prev + 1));

  const stats = useMemo(() => {
    const total = promotionData?.total ?? 0;
    if (!total) return { total: 0, promoted: 0, summerTraining: 0, retained: 0, pending: 0, graduated: 0 };
    return {
      total,
      promoted: studentList.filter((s) => s.status === "promoted" || s.status === "already_promoted").length,
      summerTraining: studentList.filter((s) => s.status === "summer_training").length,
      retained: studentList.filter((s) => s.status === "retained").length,
      pending: studentList.filter((s) => s.status === "pending").length,
      graduated: studentList.filter((s) => s.status === "GRADUATED").length,
    };
  }, [studentList, promotionData]);

  const promoteableStudents = studentList.filter((s) => s.canPromote && s.status !== "summer_training");
  const hasPromotedStudents = studentList.some(
    (s) => s.enrollmentStatus === "promoted" || s.enrollmentStatus === "GRADUATED",
  );
  const isGrade12 = selectedGrade === "12";
  const canPromote = lockStatusData?.canPromote !== false;

  const handleSelectAll = () => {
    if (selectedStudents.size === promoteableStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(promoteableStudents.map((s) => s.enrollmentId)));
    }
  };

  const handleSelectStudent = (enrollmentId) => {
    const newSet = new Set(selectedStudents);
    if (newSet.has(enrollmentId)) {
      newSet.delete(enrollmentId);
    } else {
      newSet.add(enrollmentId);
    }
    setSelectedStudents(newSet);
  };

  const handleBulkPromote = async () => {
    if (promoting || selectedStudents.size === 0) {
      if (selectedStudents.size === 0) toast.warn("Vui lòng chọn học sinh để lên lớp.");
      return;
    }
    if (!canPromote) {
      toast.warn("Chưa thể lên lớp. Vui lòng kiểm tra trạng thái khóa điểm.");
      return;
    }
    setPromoting(true);
    try {
      let syId = selectedSchoolYear;
      if (typeof syId === "string" && isNaN(Number(syId))) {
        syId = await resolveSchoolYearId(syId);
      }
      const financeRes = await promotionService.getFinanceCheck(selectedClass, syId);
      const financeData = financeRes;
      if (financeData?.hasUnpaidStudents) {
        setFinanceModal(financeData);
        return;
      }
      promoteMutation.mutate({ isGrade12 });
    } catch {
      toast.error("Không thể kiểm tra công nợ.");
    } finally {
      setPromoting(false);
    }
  };

  const handleConfirmPromote = () => {
    setFinanceModal(null);
    promoteMutation.mutate({ isGrade12 });
  };

  const handleSinglePromote = async (enrollmentId) => {
    try {
      await promotionService.singlePromote(enrollmentId);
      toast.success("Đã lên lớp học sinh.");
      refetch();
    } catch {
      toast.error("Không thể lên lớp học sinh này.");
    }
  };

  const handleRollback = (reason) => {
    rollbackMutation.mutate(reason || "Hủy lên lớp thủ công");
  };

  const manualPromoteMutation = useMutation({
    mutationFn: async ({ enrollmentId, reason }) => {
      return promotionService.manualPromote(enrollmentId, reason);
    },
    onSuccess: (data) => {
      const res = data?.data || data || {};
      toast.success(res?.data?.message || "Đã xét lên lớp thủ công.");
      setManualPromoteModal(null);
      refetch();
    },
    onError: () => {
      toast.error("Không thể xét lên lớp thủ công.");
    },
  });

  const exportToExcel = () => {
    toast.info("Đang xuất Excel...");
  };

  return (
    <div className="promotion-page">
      <PageHeader
        title="Xếp Lớp & Lên Lớp"
        subtitle="Quản lý xếp lớp, lên lớp và rèn luyện hè"
        actions={
          <SchoolYearTermSelector
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            onYearChange={handleYearArrow}
            onTermChange={handleTermChange}
            showTerm={true}
          />
        }
      />

      {/* Lock Status Warning */}
      {!canPromote && lockStatusData && (
        <div className="promotion-warning-banner">
          <FiAlertTriangle />
          <div>
            <strong>Chưa thể lên lớp:</strong> {lockStatusData.reason}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="promotion-stats-grid">
        <div className="promotion-stat-card total">
          <FiAward className="stat-icon" />
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Tổng số HS</span>
          </div>
        </div>
        <div className="promotion-stat-card success">
          <FiCheckCircle className="stat-icon" />
          <div className="stat-content">
            <span className="stat-value">{stats.promoted + stats.graduated}</span>
            <span className="stat-label">{isGrade12 ? "Tốt nghiệp" : "Được lên lớp"}</span>
          </div>
        </div>
        <div className="promotion-stat-card warning">
          <FiAlertTriangle className="stat-icon" />
          <div className="stat-content">
            <span className="stat-value">{stats.summerTraining}</span>
            <span className="stat-label">Rèn luyện hè</span>
          </div>
        </div>
        <div className="promotion-stat-card danger">
          <FiXCircle className="stat-icon" />
          <div className="stat-content">
            <span className="stat-value">{stats.retained}</span>
            <span className="stat-label">Ở lại lớp</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="promotion-toolbar">
        <div className="promotion-filters">
          <div className="filter-group">
            <label>Khối</label>
            <Select
              variant="custom"
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                const firstClass = filteredClassOptions.find((c) => !e.target.value || e.target.value === "all" || c.grade === e.target.value);
                if (firstClass) setSelectedClass(firstClass.value);
              }}
              options={[
                { value: "10", label: "Khối 10" },
                { value: "11", label: "Khối 11" },
                { value: "12", label: "Khối 12" },
              ]}
            />
          </div>
          <div className="filter-group">
            <label>Lớp</label>
            <Select
              variant="custom"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              options={filteredClassOptions.map((c) => ({ value: c.value, label: c.label }))}
            />
          </div>
          <div className="filter-group search">
            <label>Tìm học sinh</label>
            <input
              type="text"
              placeholder="Tên hoặc mã HS..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        <div className="promotion-actions">
          {hasPromotedStudents && (
            <button
              className="btn-rollback"
              onClick={() => setRollbackModal(true)}
            >
              <FiRotateCcw /> Hủy lên lớp
            </button>
          )}
          <button className="btn-export" onClick={exportToExcel}>
            <FiDownload /> Xuất Excel
          </button>
          <button
            className={isGrade12 ? "btn-graduate" : "btn-promote-all"}
            onClick={handleBulkPromote}
            disabled={selectedStudents.size === 0 || !canPromote || promoting}
          >
            <FiCheck /> {isGrade12 ? "Xét tốt nghiệp" : "Lên lớp"} ({selectedStudents.size})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="promotion-table-container">
        {isLoading && <div className="promotion-loading">Đang tải dữ liệu...</div>}
        {!isLoading && !promotionData && (
          <EmptyState title="Chưa chọn lớp" description="Vui lòng chọn lớp để xem danh sách xếp lớp." compact />
        )}
        {!isLoading && promotionData && studentList.length === 0 && (
          <EmptyState title="Không tìm thấy học sinh" description="Không có học sinh nào trong lớp này." compact />
        )}
        {!isLoading && studentList.length > 0 && (
          <table className="promotion-table">
            <thead>
              <tr>
                <th className="col-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedStudents.size === promoteableStudents.length && promoteableStudents.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="col-name">Họ tên học sinh</th>
                <th className="col-gpa">Điểm HK1</th>
                <th className="col-gpa">Điểm HK2</th>
                <th className="col-gpa">Điểm TB cả năm</th>
                <th className="col-conduct">HK1</th>
                <th className="col-conduct">HK2</th>
                <th className="col-conduct">Cả năm</th>
                <th className="col-absent">Ngày nghỉ</th>
                <th className="col-next">Lớp năm sau</th>
                <th className="col-status">Trạng thái</th>
                <th className="col-actions">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedStudents.map((student) => {
                const statusInfo = STATUS_COLORS[student.status] || STATUS_COLORS.pending;
                const isSummerTraining = student.status === "summer_training";
                const isAlreadyPromoted = student.status === "already_promoted";
                const canSelect = student.canPromote && !isSummerTraining && !isAlreadyPromoted;
                const isSelected = selectedStudents.has(student.enrollmentId);

                return (
                  <tr key={student.enrollmentId} className={isSummerTraining ? "summer-training-row" : ""}>
                    <td className="col-checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectStudent(student.enrollmentId)}
                        disabled={!canSelect}
                        title={!canSelect ? "Học sinh không thể chọn để lên lớp" : ""}
                      />
                    </td>
                    <td className="col-name">
                      <div className="student-info">
                        <div className="student-avatar">{(student.studentName || "?").charAt(0)}</div>
                        <div>
                          <strong>{student.studentName}</strong>
                          <br />
                          <small>{student.studentCode}</small>
                        </div>
                        {isSummerTraining && (
                          <Link
                            to={`/management/summer-training?class=${selectedClass}`}
                            className="summer-badge-link"
                            title="Chuyển sang rèn luyện hè"
                          >
                            🔶
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className="col-gpa">
                      <span className={`gpa-value ${student.hk1Avg !== null ? (student.hk1Avg >= 5 ? "pass" : "fail") : ""}`}>
                        {student.hk1Avg !== null ? student.hk1Avg.toFixed(2) : "—"}
                      </span>
                    </td>
                    <td className="col-gpa">
                      <span className={`gpa-value ${student.hk2Avg !== null ? (student.hk2Avg >= 5 ? "pass" : "fail") : ""}`}>
                        {student.hk2Avg !== null ? student.hk2Avg.toFixed(2) : "—"}
                      </span>
                    </td>
                    <td className="col-gpa">
                      <span className={`gpa-value ${student.annualAvg !== null ? (student.annualAvg >= 5 ? "pass" : "fail") : ""}`}>
                        {student.annualAvg !== null ? student.annualAvg.toFixed(2) : "—"}
                      </span>
                    </td>
                    <td className="col-conduct">
                      <span className="conduct-badge">{student.hk1Conduct || "—"}</span>
                    </td>
                    <td className="col-conduct">
                      <span className="conduct-badge">{student.hk2Conduct || "—"}</span>
                    </td>
                    <td className="col-conduct">
                      <span className="conduct-badge annual">{student.annualConduct || "—"}</span>
                    </td>
                    <td className="col-absent">
                      <span className={`absent-days ${student.absentDays > 10 ? "high" : ""}`}>
                        {student.absentDays} ngày
                      </span>
                    </td>
                    <td className="col-next">
                      <span className="next-class">{student.nextClass || "—"}</span>
                    </td>
                    <td className="col-status">
                      <span className={`status-badge ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="col-actions">
                      <div className="action-buttons">
                        <button
                          className="btn-detail"
                          onClick={() => setDetailModal(student)}
                          title="Xem chi tiết"
                        >
                          <FiEye />
                        </button>
                        {canSelect && (
                          <button
                            className="btn-promote-single"
                            onClick={() => handleSinglePromote(student.enrollmentId)}
                            title="Lên lớp"
                          >
                            <FiChevronRight />
                          </button>
                        )}
                        {!canSelect && !isAlreadyPromoted && student.status !== "promoted" && student.status !== "GRADUATED" && (
                          <button
                            className="btn-promote-override"
                            onClick={() => setManualPromoteModal({ student, reason: "" })}
                            title="Xét lên lớp thủ công"
                          >
                            <FiLock />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="promotion-pagination">
          <button className="page-btn" onClick={goPrevPage} disabled={effectivePage === 1}>
            <FiChevronLeft />
          </button>
          <div className="page-indicator">
            <span>{effectivePage}</span>
            <small>/ {totalPages}</small>
          </div>
          <button className="page-btn" onClick={goNextPage} disabled={effectivePage === totalPages}>
            <FiChevronRight />
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (
        <div className="promotion-modal-overlay" onClick={() => setDetailModal(null)}>
          <div className="promotion-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết xếp lớp</h3>
              <button className="btn-close" onClick={() => setDetailModal(null)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="student-detail-header">
                <div className="student-avatar large">{(detailModal.studentName || "?").charAt(0)}</div>
                <div>
                  <h4>{detailModal.studentName}</h4>
                  <p>Mã HS: {detailModal.studentCode}</p>
                </div>
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Điểm TB HK1</label>
                  <span>{detailModal.hk1Avg !== null ? detailModal.hk1Avg.toFixed(2) : "—"}</span>
                </div>
                <div className="detail-item">
                  <label>Điểm TB HK2</label>
                  <span>{detailModal.hk2Avg !== null ? detailModal.hk2Avg.toFixed(2) : "—"}</span>
                </div>
                <div className="detail-item">
                  <label>Điểm TB cả năm</label>
                  <span>{detailModal.annualAvg !== null ? detailModal.annualAvg.toFixed(2) : "—"}</span>
                </div>
                <div className="detail-item">
                  <label>Hạnh kiểm HK1</label>
                  <span>{detailModal.hk1Conduct || "—"}</span>
                </div>
                <div className="detail-item">
                  <label>Hạnh kiểm HK2</label>
                  <span>{detailModal.hk2Conduct || "—"}</span>
                </div>
                <div className="detail-item">
                  <label>Hạnh kiểm cả năm</label>
                  <span>{detailModal.annualConduct || "—"}</span>
                </div>
                <div className="detail-item">
                  <label>Số ngày nghỉ</label>
                  <span>{detailModal.absentDays} ngày</span>
                </div>
                <div className="detail-item">
                  <label>Trạng thái</label>
                  <span className={`status-badge ${STATUS_COLORS[detailModal.status]?.bg} ${STATUS_COLORS[detailModal.status]?.text}`}>
                    {STATUS_COLORS[detailModal.status]?.label || "Chưa xác định"}
                  </span>
                </div>
                {detailModal.note && (
                  <div className="detail-item full">
                    <label>Ghi chú</label>
                    <span>{detailModal.note}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finance Warning Modal */}
      {financeModal && (
        <div className="promotion-modal-overlay" onClick={() => setFinanceModal(null)}>
          <div className="promotion-modal finance-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header warning">
              <h3><FiAlertTriangle /> Cảnh báo công nợ</h3>
              <button className="btn-close" onClick={() => setFinanceModal(null)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p className="finance-summary">
                Có <strong>{financeModal.students?.length || 0} học sinh</strong> chưa thanh toán công nợ.
                Tổng số tiền chưa thanh toán: <strong>{formatCurrency(financeModal.totalUnpaid || 0)} đ</strong>
              </p>
              <div className="finance-student-list">
                <table>
                  <thead>
                    <tr>
                      <th>Họ tên</th>
                      <th>Mã HS</th>
                      <th>Số công nợ</th>
                      <th>Số tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(financeModal.students || []).map((student) => (
                      <tr key={student.enrollmentId}>
                        <td>{student.studentName}</td>
                        <td>{student.studentCode}</td>
                        <td>{student.invoiceCount}</td>
                        <td className="amount">{formatCurrency(student.unpaidAmount)} đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setFinanceModal(null)}>
                <FiX /> Hủy
              </button>
              <button className="btn-proceed" onClick={handleConfirmPromote}>
                <FiCheck /> Bỏ qua, cho lên lớp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rollback Confirmation Modal */}
      {rollbackModal && (
        <div className="promotion-modal-overlay" onClick={() => setRollbackModal(false)}>
          <div className="promotion-modal rollback-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header danger">
              <h3><FiRotateCcw /> Xác nhận hủy lên lớp</h3>
              <button className="btn-close" onClick={() => setRollbackModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p>Bạn có chắc chắn muốn hủy lên lớp cho tất cả học sinh đã được xét trong lớp này?</p>
              <p className="warning-text">Hành động này sẽ đưa các học sinh về trạng thái "Đang học".</p>
              <div className="form-group">
                <label>Lý do (tùy chọn)</label>
                <input
                  type="text"
                  id="rollback-reason"
                  placeholder="Nhập lý do hủy lên lớp..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setRollbackModal(false)}>
                <FiX /> Đóng
              </button>
              <button
                className="btn-danger"
                onClick={() => {
                  const reasonInput = document.getElementById("rollback-reason");
                  handleRollback(reasonInput?.value || "");
                }}
              >
                <FiRotateCcw /> Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Promote Override Modal */}
      {manualPromoteModal && (
        <div className="promotion-modal-overlay" onClick={() => setManualPromoteModal(null)}>
          <div className="promotion-modal rollback-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header danger">
              <h3><FiLock /> Xét lên lớp thủ công</h3>
              <button className="btn-close" onClick={() => setManualPromoteModal(null)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <p>
                Bạn đang xét lên lớp thủ công cho học sinh:{" "}
                <strong>{manualPromoteModal.student?.studentName}</strong>
              </p>
              <p className="warning-text">
                Hành động này bỏ qua kiểm tra rèn luyện hè. Vui lòng nhập lý do rõ ràng.
              </p>
              <div className="form-group">
                <label>Lý do override <span style={{ color: "red" }}>*</span></label>
                <textarea
                  id="override-reason"
                  rows={3}
                  placeholder="VD: Học sinh đã hoàn thành rèn luyện hè tại địa phương, được phép của Hiệu trưởng..."
                  defaultValue={manualPromoteModal.reason}
                  onChange={(e) =>
                    setManualPromoteModal((prev) => ({ ...prev, reason: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setManualPromoteModal(null)}>
                <FiX /> Đóng
              </button>
              <button
                className="btn-danger"
                disabled={
                  !manualPromoteModal.reason?.trim() ||
                  manualPromoteMutation.isPending
                }
                onClick={() => {
                  manualPromoteMutation.mutate({
                    enrollmentId: manualPromoteModal.student.enrollmentId,
                    reason: manualPromoteModal.reason,
                  });
                }}
              >
                <FiLock /> Xác nhận override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
