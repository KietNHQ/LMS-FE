import { useState, useEffect } from "react";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { SchoolYearTermSelector, PageHeader } from "../../../components/common";
import { resolveSchoolYearId, resolveSemesterId } from "../../../services/shared/schoolYearLookup";
import {
  FiAward, FiActivity, FiBookOpen, FiPlay, FiCpu,
  FiUserCheck, FiEye, FiClock, FiFileText, FiLock,
  FiUnlock, FiCheckCircle, FiAlertTriangle
} from "react-icons/fi";
import { toast } from "react-toastify";
import { gradeService } from "../../../services/pages/management/grades/gradeService";
import { classesService } from "../../../services/pages/management/classes/classesService";
  import { studentsService } from "../../../services/pages/management/users/studentsService";
import "./ManagementGrades.css";

export default function ManagementGrades() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Lock status
  const [lockStatus, setLockStatus] = useState({
    status: "draft",
    totalGrades: 0,
    finalizedCount: 0,
    pendingCount: 0,
    draftCount: 0,
    finalizedGradeIds: [],
    byTeacher: [],
  });
  const [isLoadingLock, setIsLoadingLock] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  // Report Card Modal
  const [activeReportCard, setActiveReportCard] = useState(null);
  const [reportCardData, setReportCardData] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  // Load all classes
  useEffect(() => {
    classesService.listClasses({ schoolYearName: selectedSchoolYear })
      .then(res => {
        setClasses(res);
        if (res.length > 0) {
          setSelectedClassId(res[0].id.toString());
        }
      })
      .catch(console.error);
  }, [selectedSchoolYear]);

  // Fetch lock status for current class + semester
  useEffect(() => {
    if (!selectedClassId) return;
    let isMounted = true;
    const fetchLockStatus = async () => {
      setIsLoadingLock(true);
      try {
        const semId = await resolveSemesterId(selectedSchoolYear, selectedTerm);
        if (!semId) return;
        const res = await gradeService.getLockStatus({ classId: selectedClassId, semesterId: semId });
        if (isMounted) {
          setLockStatus(res?.data || {
            status: "draft",
            totalGrades: 0,
            finalizedCount: 0,
            pendingCount: 0,
            draftCount: 0,
            finalizedGradeIds: [],
            byTeacher: [],
          });
        }
      } catch (err) {
        console.error("Failed to load lock status:", err);
      } finally {
        if (isMounted) setIsLoadingLock(false);
      }
    };
    fetchLockStatus();
    return () => { isMounted = false; };
  }, [selectedClassId, selectedSchoolYear, selectedTerm]);

  // Load students & grades
  useEffect(() => {
    if (!selectedClassId) return;
    let isMounted = true;
    const fetchClassGrades = async () => {
      setIsLoading(true);
      try {
        const schoolYearId = await resolveSchoolYearId(selectedSchoolYear);
        const semester1Id = await resolveSemesterId(selectedSchoolYear, "hk1");
        const semester2Id = await resolveSemesterId(selectedSchoolYear, "hk2");

        const classStudentsRaw = await studentsService.getClassStudents(Number(selectedClassId), { schoolYearId }).catch(() => []);
        const classStudents = Array.isArray(classStudentsRaw) ? classStudentsRaw : [];

        const resolvedStudents = await Promise.all(
          classStudents.map(async (student) => {
            try {
              const enrollmentId = student.enrollmentId || student.id;

              // Batch: get report card for HK1, HK2, and conduct
              const cardRes = await gradeService.getReportCard(enrollmentId, { schoolYearId }).catch(() => null);
              const card = cardRes || {};

              const { semester1, semester2, gpa: yearGpaRaw } = card.grades || {};
              const hk1Gpa = semester1?.gpa != null ? parseFloat(semester1.gpa.toFixed(2)) : null;
              const hk2Gpa = semester2?.gpa != null ? parseFloat(semester2.gpa.toFixed(2)) : null;
              const yearGpaCalc = hk1Gpa != null && hk2Gpa != null
                ? parseFloat(((hk1Gpa + 2 * hk2Gpa) / 3).toFixed(2))
                : (hk2Gpa ?? hk1Gpa ?? null);

              // Conduct: use the classification level from report card
              const conductLevel = card.conductClassification?.level || "Tốt";

              return {
                ...student,
                hk1Gpa,
                hk2Gpa,
                yearGpa: yearGpaCalc,
                conductLevel,
              };
            } catch (err) {
              return {
                ...student,
                hk1Gpa: null,
                hk2Gpa: null,
                yearGpa: null,
                conductLevel: "Tốt",
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

  // Report Card
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

      const hk1Gpa = semester1?.gpa;
      const hk2Gpa = semester2?.gpa;
      const yearGpaCalc =
        hk1Gpa != null && hk2Gpa != null
          ? (hk1Gpa + 2 * hk2Gpa) / 3
          : hk2Gpa ?? hk1Gpa;

      const subjectMap = {};
      hk1Results.forEach((r) => {
        subjectMap[r.subjectName] = { name: r.subjectName, hk1Average: r.averageScore };
      });
      hk2Results.forEach((r) => {
        if (!subjectMap[r.subjectName]) subjectMap[r.subjectName] = { name: r.subjectName };
        subjectMap[r.subjectName].hk2Average = r.averageScore;
      });
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

  // Unlock all finalized grades in this class/semester
  const handleUnlockAll = async () => {
    const { finalizedCount } = lockStatus;
    if (!finalizedCount || finalizedCount === 0) {
      toast.info("Không có điểm nào đang bị khóa.");
      return;
    }
    const selectedClass = classes.find(c => c.id.toString() === selectedClassId);
    const ok = window.confirm(
      `Mở khóa ${finalizedCount} điểm đã chốt ở lớp ${selectedClass?.name || selectedClassId}?\nĐiểm sẽ chuyển về trạng thái bản nháp để giáo viên có thể chỉnh sửa.`
    );
    if (!ok) return;

    setIsUnlocking(true);
    try {
      const semId = await resolveSemesterId(selectedSchoolYear, selectedTerm);
      const res = await gradeService.unlockClassGrades(selectedClassId, {
        semesterId: semId,
        notes: "Manager mở khóa sửa điểm",
      });

      if (res?.success) {
        toast.success(`Đã mở khóa ${res.data?.unlockedCount || finalizedCount} điểm!`);
        const refreshed = await gradeService.getLockStatus({ classId: selectedClassId, semesterId: semId });
        setLockStatus(refreshed?.data || {
          status: "draft",
          totalGrades: 0,
          finalizedCount: 0,
          pendingCount: 0,
          draftCount: 0,
          finalizedGradeIds: [],
          byTeacher: [],
        });
      } else {
        toast.error(res?.error || "Không thể mở khóa điểm.");
      }
    } catch (err) {
      console.error("Unlock error:", err);
      toast.error("Lỗi khi mở khóa điểm.");
    } finally {
      setIsUnlocking(false);
    }
  };

  // Lock all pending grades in this class/semester (batch finalize)
  const handleLockAll = async () => {
    const selectedClass = classes.find(c => c.id.toString() === selectedClassId);
    const ok = window.confirm(
      `Chốt tất cả điểm đang chờ duyệt của lớp ${selectedClass?.name || selectedClassId}?\nHành động này không thể hoàn tác.`
    );
    if (!ok) return;

    setIsLocking(true);
    try {
      const semId = await resolveSemesterId(selectedSchoolYear, selectedTerm);
      const res = await gradeService.finalizeClass(selectedClassId, {
        semesterId: semId,
        notes: "Manager chốt điểm hàng loạt",
      });
      if (res?.success) {
        toast.success(`Đã chốt ${res.data?.finalizedCount || 0} điểm!`);
        const refreshed = await gradeService.getLockStatus({ classId: selectedClassId, semesterId: semId });
        setLockStatus(refreshed?.data || {
          status: "draft",
          totalGrades: 0,
          finalizedCount: 0,
          pendingCount: 0,
          draftCount: 0,
          finalizedGradeIds: [],
          byTeacher: [],
        });
      } else {
        toast.error(res?.error || "Không thể chốt điểm.");
      }
    } catch (err) {
      console.error("Lock error:", err);
      toast.error("Lỗi khi chốt điểm.");
    } finally {
      setIsLocking(false);
    }
  };

  // Lock status badge
  const lockStatusConfig = {
    draft:       { label: "Bản nháp",       icon: <FiActivity />,  cls: "mg-lock--draft" },
    pending:     { label: "Chờ duyệt",      icon: <FiClock />,     cls: "mg-lock--pending" },
    finalized:   { label: "Đã chốt điểm",  icon: <FiLock />,     cls: "mg-lock--finalized" },
    mixed:       { label: "Trộn lẫn",        icon: <FiAlertTriangle />, cls: "mg-lock--mixed" },
  };
  const lockConfig = lockStatusConfig[lockStatus.status] || lockStatusConfig.draft;

  return (
    <div className="management-grades-page">
      <PageHeader
        title="Quản Lý Điểm Số"
        eyebrow="Theo dõi & phê duyệt điểm học sinh"
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

      {/* Lock Status Bar */}
      <div className={`mg-lock-bar ${lockConfig.cls}`}>
        <div className="mg-lock-bar__left">
          <span className="mg-lock-icon">{lockConfig.icon}</span>
          <span className="mg-lock-label">{lockConfig.label}</span>
          {lockStatus.totalGrades > 0 && (
            <span className="mg-lock-stats">
              {lockStatus.finalizedCount > 0 && <span className="mg-lock-stat finalized">{lockStatus.finalizedCount} đã chốt</span>}
              {lockStatus.pendingCount > 0 && <span className="mg-lock-stat pending">{lockStatus.pendingCount} chờ duyệt</span>}
              {lockStatus.draftCount > 0 && <span className="mg-lock-stat draft">{lockStatus.draftCount} bản nháp</span>}
            </span>
          )}
        </div>
        {lockStatus.finalizedCount > 0 && (
          <button
            className="mg-btn-unlock"
            onClick={handleUnlockAll}
            disabled={isUnlocking}
          >
            <FiUnlock />
            {isUnlocking ? "Đang mở khóa..." : `Mở khóa (${lockStatus.finalizedCount})`}
          </button>
        )}
        {lockStatus.pendingCount > 0 && (
          <button
            className="mg-btn-lock"
            onClick={handleLockAll}
            disabled={isLocking}
          >
            <FiLock />
            {isLocking ? "Đang chốt..." : `Khóa tất cả (${lockStatus.pendingCount})`}
          </button>
        )}
      </div>

      {/* Teacher Submission Status Panel */}
                  {lockStatus.byTeacher && lockStatus.byTeacher.length > 0 && (
        <div className="mg-teacher-panel">
          <h4 className="mg-teacher-panel__title">
            <FiUserCheck /> Tình trạng chốt điểm theo giáo viên
          </h4>
          <div className="mg-teacher-list">
            {lockStatus.byTeacher.map((t) => {
              const isAllDone = t.finalized === t.total && t.total > 0;
              const isAllPending = t.pending > 0 && t.finalized === 0;
              const teacherCls = isAllDone ? "all-done" : isAllPending ? "all-pending" : "partial";
              return (
                <div key={t.teacherId} className="mg-teacher-row">
                  <span className="mg-teacher-name">GV #{t.teacherId}</span>
                  <div className="mg-teacher-progress">
                    <div className="mg-progress-bar">
                      <div
                        className={`mg-progress-fill ${teacherCls}`}
                        style={{ width: `${t.total > 0 ? (t.finalized / t.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className={`mg-teacher-badge ${teacherCls}`}>
                      {t.finalized}/{t.total} đã chốt
                    </span>
                  </div>
                  {isAllDone && (
                    <span className="mg-teacher-done-icon"><FiCheckCircle /></span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Control Actions Bar */}
      <div className="mg-actions-row">
        <button
          onClick={() => window.location.reload()}
          disabled={isCalculating || students.length === 0}
          className="mg-btn-calc"
        >
          <FiCpu /> Đồng bộ lại điểm
        </button>
      </div>

      {/* Student Table */}
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
                  <th className="text-center">ĐTB HKI</th>
                  <th className="text-center">ĐTB HKII</th>
                  <th className="text-center">TB cả năm</th>
                  <th className="text-center">Hạnh kiểm</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="mg-empty-state">Không tìm thấy học sinh nào trong lớp đã chọn.</td>
                  </tr>
                ) : (
                  students.map((student, idx) => (
                    <tr key={idx}>
                      <td className="bold">HS{student.id}</td>
                      <td className="bold">{student.name}</td>
                      <td className="text-center gpa-cell">{fmtGpa(student.hk1Gpa)}</td>
                      <td className="text-center gpa-cell">{fmtGpa(student.hk2Gpa)}</td>
                      <td className="text-center gpa-cell bold">{fmtGpa(student.yearGpa)}</td>
                      <td className="text-center">
                        <span className={`conduct-pill conduct-pill--${conductColor(student.conductLevel)}`}>
                          {student.conductLevel || "Tốt"}
                        </span>
                      </td>
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

      {/* REPORT CARD MODAL */}
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

                  {/* GPA Summary */}
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

// ─── Helpers ───────────────────────────────────────────────────────────────

function fmtGpa(val) {
  if (val == null || val === "") return "—";
  return parseFloat(parseFloat(val).toFixed(2));
}

function fmtScore(val) {
  if (val == null) return "—";
  return parseFloat(val.toFixed(1));
}

function conductColor(level) {
  if (!level) return "good";
  const l = level.toLowerCase();
  if (l.includes("tốt")) return "good";
  if (l.includes("khá")) return "good";
  if (l.includes("đạt")) return "warning";
  if (l.includes("chưa")) return "danger";
  return "good";
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
