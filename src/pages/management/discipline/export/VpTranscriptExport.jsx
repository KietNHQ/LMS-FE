/**
 * VpTranscriptExport
 * Trang xuất học bạ (PL1-PL6) theo Thông tư 22/2021/TT-BGDĐT
 *
 * Layout: chọn học sinh → chọn năm học → xem trước → xuất Excel / PDF
 */

import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiFileText, FiSearch, FiCheckCircle, FiUsers,
  FiAward as FiGraduation, FiXCircle as FiGradFail
} from "react-icons/fi";
import { toast } from "react-toastify";
import { vpTranscriptService } from "../../../../services/pages/management/vp-discipline/vpTranscriptService";
import { classesService } from "../../../../services/pages/management/classes/classesService";
import { studentsService } from "../../../../services/pages/management/users/studentsService";
import { useSchoolYearTerm } from "../../../../hooks/useSchoolYearTerm";
import { resolveSchoolYearId, resolveSemesterId } from "../../../../services/shared/schoolYearLookup";
import PageHeader from "../../../../components/common/PageHeader/PageHeader";
import "./VpTranscriptExport.css";

const getStudentName = (student = {}) => (
  [student.surname || student.lastName || "", student.given_name || student.givenName || student.firstName || ""]
    .filter(Boolean)
    .join(" ") ||
  student.full_name ||
  student.fullName ||
  student.name ||
  "—"
);

const buildFlatEnrollment = (student = {}) => {
  const enrollmentId = student.enrollment_id || student.enrollmentId;
  if (!enrollmentId) return null;
  return {
    id: enrollmentId,
    enrollment_id: enrollmentId,
    school_year_id: student.school_year_id || student.schoolYearId || null,
    schoolYearId: student.school_year_id || student.schoolYearId || null,
    class_id: student.class_id || student.classId || null,
    classId: student.class_id || student.classId || null,
    class_name: student.class_name || student.className || null,
    className: student.class_name || student.className || null,
    status: student.enrollment_status || student.status || null,
  };
};

const getStudentEnrollments = (student = {}) => {
  if (Array.isArray(student.enrollments) && student.enrollments.length > 0) {
    return student.enrollments;
  }
  const fallback = buildFlatEnrollment(student);
  return fallback ? [fallback] : [];
};

const resolveStudentEnrollment = (student, schoolYearId) => {
  const enrollments = getStudentEnrollments(student);
  if (!enrollments.length) return null;
  return (
    enrollments.find(
      (e) =>
        String(e.school_year_id || e.schoolYearId || "") === String(schoolYearId || "") &&
        ["active", "studying", "Đang học"].includes(e.status || student?.status)
    ) ||
    enrollments.find(
      (e) => String(e.school_year_id || e.schoolYearId || "") === String(schoolYearId || "")
    ) ||
    enrollments[0]
  );
};

const toDisplayScore = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(1) : "—";
};

const calculateYearSubjectScore = (hk1, hk2) => {
  const sem1 = Number(hk1);
  const sem2 = Number(hk2);
  if (Number.isFinite(sem1) && Number.isFinite(sem2)) {
    return Math.round(((sem1 + sem2 * 2) / 3) * 10) / 10;
  }
  if (Number.isFinite(sem2)) return sem2;
  if (Number.isFinite(sem1)) return sem1;
  return null;
};

export default function VpTranscriptExport() {
  const { selectedSchoolYear, selectedTerm, handleTermChange } = useSchoolYearTerm();

  // Keep a resolved numeric schoolYearId in sync with selectedSchoolYear string
  const [resolvedSyId, setResolvedSyId] = useState(null);
  const [resolvedSemesterIds, setResolvedSemesterIds] = useState({ hk1: null, hk2: null });

  useEffect(() => {
    if (!selectedSchoolYear) {
      setResolvedSyId(null);
      return;
    }
    if (typeof selectedSchoolYear === "number") {
      setResolvedSyId(selectedSchoolYear);
      return;
    }
    resolveSchoolYearId(selectedSchoolYear).then(setResolvedSyId);
  }, [selectedSchoolYear]);

  useEffect(() => {
    let cancelled = false;
    const loadSemesterIds = async () => {
      if (!selectedSchoolYear) {
        setResolvedSemesterIds({ hk1: null, hk2: null });
        return;
      }
      const [hk1, hk2] = await Promise.all([
        resolveSemesterId(selectedSchoolYear, "hk1"),
        resolveSemesterId(selectedSchoolYear, "hk2"),
      ]);
      if (!cancelled) {
        setResolvedSemesterIds({ hk1: hk1 || null, hk2: hk2 || null });
      }
    };
    loadSemesterIds();
    return () => {
      cancelled = true;
    };
  }, [selectedSchoolYear]);

  // ── Mode toggle: 'search' = single student, 'class' = class mode ──
  const [exportMode, setExportMode] = useState("search"); // "search" | "class"

  // ── Class mode state ──
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [classStudents, setClassStudents] = useState([]);
  const [selectedClassStudentIds, setSelectedClassStudentIds] = useState(new Set());
  const [isLoadingClass, setIsLoadingClass] = useState(false);

  // ── Search mode state ──
  const [searchKeyword, setSearchKeyword] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [transcriptData, setTranscriptData] = useState(null);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // ── Shared filter state ──
  const [plFilter, setPlFilter] = useState(""); // PL1-PL6 grade level filter

  // ── Semester options ──
  const semesterOptions = [
    { value: "hk1", label: "Học kỳ 1" },
    { value: "hk2", label: "Học kỳ 2" },
    { value: "all", label: "Cả năm" },
  ];

  // Search students when keyword changes (debounced)
  useEffect(() => {
    if (exportMode !== "search") {
      setStudents([]);
      return;
    }
    if (selectedStudent && !searchKeyword.trim()) {
      setStudents([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await vpTranscriptService.searchStudents(searchKeyword.trim(), {
          schoolYearId: resolvedSyId,
          limit: searchKeyword.trim() ? 20 : 30,
        });
        setStudents(Array.isArray(results) ? results.slice(0, 20) : []);
      } catch {
        setStudents([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [exportMode, resolvedSyId, searchKeyword, selectedStudent]);

  // Load classes when school year or grade filter changes
  useEffect(() => {
    if (exportMode !== "class") return;
    const params = {};
    if (plFilter) params.gradeLevelId = parseInt(plFilter, 10);
    classesService
      .listClasses({ schoolYearId: resolvedSyId, limit: 500, ...params })
      .then(setClasses)
      .catch(() => setClasses([]));
  }, [exportMode, resolvedSyId, plFilter]);

  // Load class students when a class or resolved school year ID changes
  useEffect(() => {
    if (!selectedClassId || !resolvedSyId) {
      setClassStudents([]);
      setSelectedClassStudentIds(new Set());
      return;
    }
    setIsLoadingClass(true);
    studentsService
      .getClassStudents(selectedClassId, { schoolYearId: resolvedSyId })
      .then((rows) => {
        setClassStudents(rows);
        setSelectedClassStudentIds(new Set(rows.map((s) => s.id)));
      })
      .catch(() => setClassStudents([]))
      .finally(() => setIsLoadingClass(false));
  }, [selectedClassId, resolvedSyId]);

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setTranscriptData(null);
    setSelectedEnrollment(resolveStudentEnrollment(student, resolvedSyId));
    setStudents([]);
    setSearchKeyword("");
  };

  // ── Class mode handlers ──
  const handleClassSelect = (classId) => {
    setSelectedClassId(classId);
  };

  const toggleClassStudent = (studentId) => {
    setSelectedClassStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const toggleSelectAllClassStudents = () => {
    if (selectedClassStudentIds.size === classStudents.length) {
      setSelectedClassStudentIds(new Set());
    } else {
      setSelectedClassStudentIds(new Set(classStudents.map((s) => s.id)));
    }
  };

  const handleExportClassSelected = async () => {
    const selected = classStudents.filter((s) => selectedClassStudentIds.has(s.id));
    if (!selected.length) {
      toast.warn("Vui lòng chọn ít nhất một học sinh.");
      return;
    }
    setIsExportingExcel(true);
    let successCount = 0;
    let failCount = 0;

    for (const student of selected) {
      const enrollment = resolveStudentEnrollment(student, resolvedSyId);

      if (!enrollment?.id) {
        failCount++;
        continue;
      }

      try {
        const data = await vpTranscriptService.getTranscriptData(enrollment.id, {
          schoolYearId: resolvedSyId,
          hk1SemesterId: resolvedSemesterIds.hk1,
          hk2SemesterId: resolvedSemesterIds.hk2,
        });
        const studentName = getStudentName(student);
        const className = enrollment?.class_name || enrollment?.className || student.className || "";
        vpTranscriptService.exportTranscriptExcel(data, {
          studentName,
          className,
          schoolYearName: selectedSchoolYear,
        });
        successCount++;
      } catch {
        failCount++;
      }
    }

    setIsExportingExcel(false);
    if (successCount > 0) {
      toast.success(
        `Đã xuất ${successCount} học bạ thành công.${failCount > 0 ? ` ${failCount} thất bại.` : ""}`
      );
    } else {
      toast.error("Không thể xuất học bạ cho học sinh đã chọn.");
    }
  };

  const handlePreview = async () => {
    if (!selectedEnrollment?.id) {
      toast.warn("Vui lòng chọn học sinh có thông tin đăng ký học tập.");
      return;
    }
    setIsLoadingData(true);
    try {
      const data = await vpTranscriptService.getTranscriptData(selectedEnrollment.id, {
        schoolYearId: resolvedSyId,
        hk1SemesterId: resolvedSemesterIds.hk1,
        hk2SemesterId: resolvedSemesterIds.hk2,
      });
      setTranscriptData(data);
      toast.success("Đã tải dữ liệu học bạ.");
    } catch (err) {
      toast.error("Không thể tải dữ liệu học bạ. Vui lòng thử lại.");
      console.error("[VpTranscriptExport] load data error:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleExportExcel = () => {
    if (!transcriptData || !selectedStudent) return;
    setIsExportingExcel(true);
    try {
      const studentName = getStudentName(selectedStudent);
      const className = selectedEnrollment?.class_name || selectedEnrollment?.className || selectedStudent.className || "";
      vpTranscriptService.exportTranscriptExcel(transcriptData, {
        studentName,
        className,
        schoolYearName: selectedSchoolYear,
      });
      toast.success("Đã xuất file Excel học bạ.");
    } catch (err) {
      toast.error("Xuất Excel thất bại.");
      console.error("[VpTranscriptExport] export Excel error:", err);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleExportPDF = async () => {
    if (!selectedEnrollment?.id || !selectedStudent?.id) return;
    setIsExportingPDF(true);
    try {
      await vpTranscriptService.exportTranscriptPDF(
        selectedEnrollment.id,
        selectedStudent.id,
        resolvedSyId
      );
      toast.success("Đã bắt đầu tải PDF học bạ.");
    } catch (err) {
      toast.error("Xuất PDF thất bại. Vui lòng thử lại.");
      console.error("[VpTranscriptExport] export PDF error:", err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Preview table: merge semester grades into rows
  const previewRows = useMemo(() => {
    if (!transcriptData?.reportCard?.semesters) return [];
    const rows = [];
    const semesters = transcriptData.reportCard.semesters;

    const sem1 = semesters.find((s) => s.semesterId === 1 || s.semesterName?.includes("I") || s.semesterName?.includes("1"));
    const sem2 = semesters.find((s) => s.semesterId === 2 || s.semesterName?.includes("II") || s.semesterName?.includes("2"));

    const allSubjects = new Map();

    if (sem1?.subjects) {
      sem1.subjects.forEach((s) => {
        const key = s.subjectName || s.subject_name || "";
        allSubjects.set(key, {
          name: key,
          hk1Score: s.averageScore ?? s.average_score ?? "",
          hk2Score: null,
          yearScore: null,
          classification: "",
        });
      });
    }

    if (sem2?.subjects) {
      sem2.subjects.forEach((s) => {
        const key = s.subjectName || s.subject_name || "";
        if (allSubjects.has(key)) {
          allSubjects.get(key).hk2Score = s.averageScore ?? s.average_score ?? "";
        } else {
          allSubjects.set(key, {
            name: key,
            hk1Score: null,
            hk2Score: s.averageScore ?? s.average_score ?? "",
            yearScore: null,
            classification: "",
          });
        }
      });
    }

    allSubjects.forEach((val) => rows.push(val));
    rows.forEach((row) => {
      row.yearScore = row.yearScore ?? calculateYearSubjectScore(row.hk1Score, row.hk2Score);
    });
    return rows;
  }, [transcriptData]);

  const reportCard = transcriptData?.reportCard;
  const studentName = selectedStudent ? getStudentName(selectedStudent) : "";
  const className = selectedEnrollment?.class_name || selectedEnrollment?.className || selectedStudent?.className || "";

  return (
    <div className="vp-transcript-export vp-discipline-layout">
      <PageHeader
        title="Xuất Học Bạ"
        description="Xuất học bạ PL1-PL6 theo Thông tư 22/2021/TT-BGDĐT"
        icon={<FiFileText size={20} />}
        actions={
          <div className="transcript-header-actions">
            <span className="transcript-school-year-badge">
              {selectedSchoolYear || "—"}
            </span>
          </div>
        }
      />

      {/* ── Mode toggle + Filters ── */}
      <section className="transcript-section">
        <div className="transcript-mode-toggle">
          <button
            className={`mode-btn ${exportMode === "search" ? "active" : ""}`}
            onClick={() => setExportMode("search")}
          >
            <FiSearch size={14} />
            Tìm học sinh
          </button>
          <button
            className={`mode-btn ${exportMode === "class" ? "active" : ""}`}
            onClick={() => setExportMode("class")}
          >
            <FiUsers size={14} />
            Xuất theo lớp
          </button>
        </div>

        <div className="transcript-filters-row">
          {/* Semester filter */}
          <div className="filter-group">
            <label className="filter-label">Học kỳ</label>
            <select
              className="transcript-filter-select"
              value={selectedTerm}
              onChange={(e) => handleTermChange(e.target.value)}
            >
              {semesterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* PL / grade level filter */}
          <div className="filter-group">
            <label className="filter-label">Khối lớp</label>
            <select
              className="transcript-filter-select"
              value={plFilter}
              onChange={(e) => setPlFilter(e.target.value)}
            >
              <option value="">Tất cả (PL1–PL6)</option>
              <option value="10">Khối 10 (PL1)</option>
              <option value="11">Khối 11 (PL2)</option>
              <option value="12">Khối 12 (PL3)</option>
            </select>
          </div>
        </div>
      </section>

      {/* ── CLASS MODE ── */}
      {exportMode === "class" && (
        <section className="transcript-section">
          <h3 className="transcript-section-title">Xuất học bạ theo lớp</h3>

          {/* Class selector */}
          <div className="transcript-filters-row">
            <div className="filter-group filter-group--wide">
              <label className="filter-label">Chọn lớp</label>
              <select
                className="transcript-filter-select"
                value={selectedClassId}
                onChange={(e) => handleClassSelect(e.target.value)}
              >
                <option value="">— Chọn lớp —</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.grade})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student table */}
          {isLoadingClass && <p className="transcript-loading-msg">Đang tải danh sách học sinh...</p>}

          {!resolvedSyId && (
            <p className="transcript-no-data">
              Vui lòng chọn năm học để tải danh sách học sinh.
            </p>
          )}

          {resolvedSyId && selectedClassId && classStudents.length === 0 && !isLoadingClass && (
            <p className="transcript-no-data">
              Lớp này chưa có học sinh hoặc chưa có dữ liệu đăng ký học tập cho năm học đã chọn.
            </p>
          )}

          {classStudents.length > 0 && (
            <>
              <div className="class-student-table-toolbar">
                <label className="class-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedClassStudentIds.size === classStudents.length}
                    onChange={toggleSelectAllClassStudents}
                  />
                  Chọn tất cả ({selectedClassStudentIds.size}/{classStudents.length})
                </label>
                <button
                  className="btn-export-excel"
                  onClick={handleExportClassSelected}
                  disabled={isExportingExcel || selectedClassStudentIds.size === 0}
                >
                  <FiDownload />
                  {isExportingExcel
                    ? "Đang xuất..."
                    : `Xuất ${selectedClassStudentIds.size} học bạ`}
                </button>
              </div>

              <div className="transcript-preview-table-wrapper">
                <table className="transcript-preview-table">
                  <thead>
                    <tr>
                      <th style={{ width: "40px" }}></th>
                      <th>Mã HS</th>
                      <th>Họ và tên</th>
                      <th>Khối</th>
                      <th>Lớp</th>
                      <th>Tình trạng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((s) => {
                      const enrollment = resolveStudentEnrollment(s, resolvedSyId);
                      const name = getStudentName(s);
                      return (
                        <tr key={s.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedClassStudentIds.has(s.id)}
                              onChange={() => toggleClassStudent(s.id)}
                            />
                          </td>
                          <td>{s.student_code || s.code || "—"}</td>
                          <td>{name}</td>
                          <td>
                            {enrollment?.grade_level_name ||
                              enrollment?.gradeLevelName ||
                              s.gradeLevelName ||
                              "—"}
                          </td>
                          <td>{enrollment?.class_name || enrollment?.className || s.className || "—"}</td>
                          <td>
                            <span className={`status-badge status-${s.status === "active" ? "active" : "inactive"}`}>
                              {s.status === "active" ? "Đang học" : s.status || "—"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {selectedClassId && classStudents.length === 0 && !isLoadingClass && (
            <p className="transcript-no-data">Lớp này chưa có học sinh.</p>
          )}
        </section>
      )}

      {/* ── SEARCH MODE ── */}
      {exportMode === "search" && (
        <>
          {/* Step 1: Chọn học sinh */}
          <section className="transcript-section">
            <h3 className="transcript-section-title">1. Chọn học sinh</h3>
            <div className="transcript-search-wrapper">
              <div className="transcript-search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc mã học sinh..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="transcript-search-input"
                />
              </div>

              {students.length > 0 && (
                <ul className="transcript-student-list">
                  {students.map((s) => {
                    const name = [s.surname || "", s.given_name || ""].filter(Boolean).join(" ");
                    return (
                      <li
                        key={s.id}
                        className={`transcript-student-item ${selectedStudent?.id === s.id ? "active" : ""}`}
                        onClick={() => handleSelectStudent(s)}
                      >
                        <span className="student-name">{name || s.full_name || "—"}</span>
                        <span className="student-meta">
                          {s.student_code || s.code || ""}
                          {s.class_name ? ` · ${s.class_name}` : ""}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}

              {isSearching && (
                <div className="transcript-searching">Đang tìm...</div>
              )}
            </div>

            {selectedStudent && (
              <div className="transcript-selected-student">
                <FiCheckCircle className="check-icon" />
                <div>
                  <strong>{studentName}</strong>
                  <span>
                    {selectedStudent.student_code || selectedStudent.code || ""}
                    {className ? ` · Lớp ${className}` : ""}
                  </span>
                </div>
                <button
                  className="transcript-clear-btn"
                  onClick={() => {
                    setSelectedStudent(null);
                    setSelectedEnrollment(null);
                    setTranscriptData(null);
                  }}
                >
                  Đổi
                </button>
              </div>
            )}
          </section>

          {/* Step 2: Tải dữ liệu + Preview */}
          {selectedStudent && (
            <section className="transcript-section">
              <div className="transcript-step-header">
                <h3 className="transcript-section-title">2. Xem trước dữ liệu</h3>
                <button
                  className="btn-preview"
                  onClick={handlePreview}
                  disabled={isLoadingData}
                >
                  {isLoadingData ? "Đang tải..." : "Tải dữ liệu"}
                </button>
              </div>

              {transcriptData && (
                <>
                  {/* Summary cards */}
                  <div className="transcript-summary-cards">
                    <div className="summary-card">
                      <span className="summary-label">Điểm TB HK I</span>
                      <span className="summary-value">
                        {reportCard?.semesters?.find((s) => s.semesterId === 1)?.averageScore ?? "—"}
                      </span>
                    </div>
                    <div className="summary-card">
                      <span className="summary-label">Điểm TB HK II</span>
                      <span className="summary-value">
                        {reportCard?.semesters?.find((s) => s.semesterId === 2)?.averageScore ?? "—"}
                      </span>
                    </div>
                    <div className="summary-card highlight">
                      <span className="summary-label">Điểm TB Cả năm</span>
                      <span className="summary-value">
                        {reportCard?.yearlyAverage ?? "—"}
                      </span>
                    </div>
                    <div className="summary-card">
                      <span className="summary-label">Xếp loại</span>
                      <span className="summary-value">
                        {reportCard?.yearlyClassification || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Graduation Eligibility Badge — only for Grade 12 */}
                  {reportCard?.graduationCheck && (
                    <div className="graduation-check-section">
                      <div className={`graduation-badge ${reportCard.graduationCheck.canGraduate ? "pass" : "fail"}`}>
                        <div className="graduation-badge-icon">
                          {reportCard.graduationCheck.canGraduate
                            ? <FiGradPass size={24} />
                            : <FiGradFail size={24} />}
                        </div>
                        <div className="graduation-badge-content">
                          <div className="graduation-badge-title">
                            {reportCard.graduationCheck.canGraduate
                              ? "Đủ điều kiện công nhận tốt nghiệp"
                              : "Chưa đủ điều kiện tốt nghiệp"}
                          </div>
                          {reportCard.graduationCheck.graduationScore != null && (
                            <div className="graduation-score">
                              Điểm học bạ: <strong>{reportCard.graduationScore.graduationScore}</strong>
                              {reportCard.graduationScore.graduationScoreDetail && (
                                <span className="graduation-score-detail">
                                  {" "}(L10: {reportCard.graduationScore.graduationScoreDetail.avg10 ?? "—"} ×1 + L11: {reportCard.graduationScore.graduationScoreDetail.avg11 ?? "—"} ×2 + L12: {reportCard.graduationScore.graduationScoreDetail.avg12 ?? "—"} ×3) / 6
                                </span>
                              )}
                            </div>
                          )}
                          {reportCard.graduationCheck.conditions && (
                            <div className="graduation-conditions">
                              <span className={`condition-chip ${reportCard.graduationCheck.conditions.minimumScore?.passed ? "pass" : "fail"}`}>
                                TB ≥ 5.0: {reportCard.graduationCheck.conditions.minimumScore?.passed ? "✓" : "✗"}
                              </span>
                              <span className={`condition-chip ${reportCard.graduationCheck.conditions.noFailedSubjects?.passed ? "pass" : "fail"}`}>
                                Không điểm liệt: {reportCard.graduationCheck.conditions.noFailedSubjects?.passed ? "✓" : "✗"}
                              </span>
                              <span className={`condition-chip ${reportCard.graduationCheck.conditions.sixSubjectsAbove5?.passed ? "pass" : "fail"}`}>
                                ≥6 môn ≥ 5.0 ({reportCard.graduationCheck.conditions.sixSubjectsAbove5?.count}/{reportCard.graduationCheck.conditions.sixSubjectsAbove5?.required}): {reportCard.graduationCheck.conditions.sixSubjectsAbove5?.passed ? "✓" : "✗"}
                              </span>
                              <span className={`condition-chip ${reportCard.graduationCheck.conditions.conduct?.passed ? "pass" : "fail"}`}>
                                HKĐ ≥ Đạt: {reportCard.graduationCheck.conditions.conduct?.passed ? "✓" : "✗"}
                              </span>
                              <span className={`condition-chip ${reportCard.graduationCheck.conditions.attendance?.passed ? "pass" : "fail"}`}>
                                Vắng &lt; 45 ngày: {reportCard.graduationCheck.conditions.attendance?.passed ? "✓" : "✗"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PL2 Preview Table */}
                  {previewRows.length > 0 && (
                    <div className="transcript-preview-table-wrapper">
                      <table className="transcript-preview-table">
                        <thead>
                          <tr>
                            <th>STT</th>
                            <th>Môn học</th>
                            <th>Điểm HK I</th>
                            <th>Điểm HK II</th>
                            <th>Điểm Cả năm</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewRows.map((row, idx) => (
                            <tr key={`preview-${row.studentId || row.enrollmentId || idx}`}>
                              <td>{idx + 1}</td>
                              <td>{row.name}</td>
                              <td>{toDisplayScore(row.hk1Score)}</td>
                              <td>{toDisplayScore(row.hk2Score)}</td>
                              <td>{toDisplayScore(row.yearScore)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {previewRows.length === 0 && (
                    <p className="transcript-no-data">
                      Chưa có dữ liệu điểm cho học sinh này.
                    </p>
                  )}
                </>
              )}
            </section>
          )}

          {/* Step 3: Xuất file */}
          {transcriptData && (
            <section className="transcript-section transcript-export-actions">
              <h3 className="transcript-section-title">3. Xuất file</h3>
              <div className="export-buttons">
                <button
                  className="btn-export-excel"
                  onClick={handleExportExcel}
                  disabled={isExportingExcel}
                >
                  <FiDownload />
                  {isExportingExcel ? "Đang xuất..." : "Xuất Excel (.xlsx)"}
                </button>
                <button
                  className="btn-export-pdf"
                  onClick={handleExportPDF}
                  disabled={isExportingPDF}
                >
                  <FiDownload />
                  {isExportingPDF ? "Đang xuất..." : "Xuất PDF (.pdf)"}
                </button>
              </div>
              <p className="export-note">
                File Excel gồm 6 sheet: PL1–PL6 theo định dạng Thông tư 22/2021/TT-BGDĐT
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
