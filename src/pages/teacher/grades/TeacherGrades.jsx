import { useMemo, useState, useEffect, useCallback } from "react";
import Modal from "../../../components/ui/Modal/Modal";
import { Select } from "../../../components/ui";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { teacherGradeService } from "../../../services/pages/teacher/teacherGradeService";
import { dataLockingService } from "../../../services/pages/admin/locking/dataLockingService";
import GradeListSection from "./components/gradeListSection/GradeListSection";
import { FiPlus, FiSave, FiX, FiTrash2, FiLock, FiUnlock, FiSend, FiUser } from "react-icons/fi";
import GradeSummarySection, { GradeSummaryHeader } from "./components/gradeSummarySection/GradeSummarySection";
import { toast } from "react-toastify";
import "./TeacherGrades.css";

const SEMESTERS = { hk1: { label: "Học kỳ 1" }, hk2: { label: "Học kỳ 2" } };
const TABS = [
  { key: "gradebook", label: "Sổ điểm" },
  { key: "overview", label: "Tổng quan lớp" },
  { key: "students", label: "Học sinh" },
];

function round1(value) {
  if (value == null || isNaN(value)) return 0;
  return Math.round(value * 10) / 10;
}

function getRank(average) {
  if (average >= 8.5) return "excellent";
  if (average >= 7.0) return "good";
  if (average >= 5.5) return "fair";
  if (average >= 4.0) return "average";
  return "weak";
}

function normalizeGradeCategory(categoryName = "", gradeItemName = "") {
  const text = `${categoryName || ""} ${gradeItemName || ""}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  if (text.includes("giua ky") || text.includes("midterm")) return "midterm";
  if (text.includes("cuoi ky") || text.includes("final")) return "final";
  return "regular";
}

function toScoreNumber(value) {
  if (value == null || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function buildStudentGradeRecords(students = [], gradeRows = [], gradeItems = []) {
  const rowsByEnrollment = {};
  for (const row of gradeRows) {
    const eid = String(row.student_enrollment_id ?? row.enrollment_id ?? "");
    if (!eid) continue;
    if (!rowsByEnrollment[eid]) rowsByEnrollment[eid] = [];
    rowsByEnrollment[eid].push({
      id: row.id,
      gradeItemId: row.grade_item_id ?? null,
      gradeItemName: row.grade_item_name || row.name || "",
      categoryName: row.category_name || "",
      categoryKey: normalizeGradeCategory(row.category_name, row.grade_item_name || row.name || ""),
      score: toScoreNumber(row.score),
      note: row.note || "",
      enteredAt: row.entered_at || row.created_at || null,
    });
  }

  return students.map((student = {}) => {
    const enrollmentId = String(student.enrollment_id ?? student.id ?? "");
    const rows = rowsByEnrollment[enrollmentId] || [];

    const regularScores = rows
      .filter((r) => r.categoryKey === "regular")
      .sort((a, b) => String(a.enteredAt || "").localeCompare(String(b.enteredAt || "")))
      .map((r, i) => ({ id: r.id, label: r.gradeItemName || `TX ${i + 1}`, score: r.score, note: r.note, gradeItemId: r.gradeItemId }));

    const midtermRow = rows.find((r) => r.categoryKey === "midterm");
    const finalRow = rows.find((r) => r.categoryKey === "final");

    const regularNums = regularScores.map((r) => r.score).filter((v) => v !== null);
    const midtermScore = midtermRow?.score ?? null;
    const finalScore = finalRow?.score ?? null;

    const weightedSum =
      regularNums.reduce((a, b) => a + b, 0) +
      (midtermScore !== null ? midtermScore * 2 : 0) +
      (finalScore !== null ? finalScore * 3 : 0);
    const denominator = regularNums.length + (midtermScore !== null ? 2 : 0) + (finalScore !== null ? 3 : 0);
    const average = denominator ? round1(weightedSum / denominator) : 0;
    const isProvisional = regularNums.length < 2 || midtermScore === null || finalScore === null;

    return {
      id: enrollmentId,
      enrollmentId,
      code: student.student_code || student.code || `HS${enrollmentId}`,
      name: student.full_name || student.name || `${student.surname || ""} ${student.given_name || ""}`.trim() || `Học sinh ${enrollmentId}`,
      status: average >= 5 ? "Đạt" : "Chưa đạt",
      rank: getRank(average),
      average,
      isProvisional,
      regularScores,
      midtermScore,
      midtermGradeItemId: midtermRow?.gradeItemId ?? null,
      finalScore,
      finalGradeItemId: finalRow?.gradeItemId ?? null,
      note: rows.map((r) => r.note).find(Boolean) || "",
      rawGrades: rows,
    };
  });
}

function dedupeById(list = []) {
  const seen = new Set();
  return list.filter((item) => {
    const key = String(item?.id ?? "");
    if (!key) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function fmtScore(val) {
  if (val == null) return "—";
  return parseFloat(Number(val).toFixed(1));
}

export default function TeacherGrades() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();

  const [assignments, setAssignments] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [gradeItems, setGradeItems] = useState([]);
  const [students, setStudents] = useState([]);
  const [gradeRows, setGradeRows] = useState([]);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("gradebook");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);
  const [editDraft, setEditDraft] = useState({ regularScores: [""], midterm: "", final: "", note: "" });
  const [atRiskDialogOpen, setAtRiskDialogOpen] = useState(false);
  const [unlockRequestOpen, setUnlockRequestOpen] = useState(false);
  const [unlockReason, setUnlockReason] = useState("");
  const [lockStatus, setLockStatus] = useState("draft");

  const [studentDetail, setStudentDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // ---- Derived from assignments ----
  const teacherClasses = useMemo(() => {
    const map = {};
    for (const a of assignments) {
      if (!map[a.classId]) {
        map[a.classId] = { id: a.classId, name: a.className, role: a.role };
      } else if (a.role === "homeroom") {
        map[a.classId].role = "homeroom";
      }
    }
    return Object.values(map);
  }, [assignments]);

  const classSubjects = useMemo(() => {
    if (!selectedClassId) return [];
    return assignments.filter((a) => String(a.classId) === String(selectedClassId));
  }, [assignments, selectedClassId]);

  const selectedAssignment = useMemo(() => {
    return classSubjects.find((a) => String(a.subjectId) === String(selectedSubjectId));
  }, [classSubjects, selectedSubjectId]);

  const isHomeroom = useMemo(() => {
    return teacherClasses.find((c) => String(c.id) === String(selectedClassId))?.role === "homeroom";
  }, [teacherClasses, selectedClassId]);

  const canEdit = useMemo(() => {
    return !isHomeroom && lockStatus !== "locked";
  }, [isHomeroom, lockStatus]);

  // ---- Reset selections on year/term change ----
  useEffect(() => {
    setSelectedClassId("");
    setSelectedSubjectId("");
  }, [selectedSchoolYear, selectedTerm]);

  // ---- Load assignments when schoolYear/term changes ----
  useEffect(() => {
    teacherGradeService.getMyAssignments({ schoolYear: selectedSchoolYear, term: selectedTerm }).then((res) => {
      const assignmentsArray = Array.isArray(res) ? res : (res?.data || []);
      setAssignments(assignmentsArray.map((a) => ({
        ...a,
        classId: a.class_id,
        className: a.class_name,
        subjectId: a.subject_id,
        subjectName: a.subject_name,
        semesterId: a.semester_id,
        semesterName: a.semester_name,
        classTeacherSubjectId: a.class_teacher_subject_id,
      })));
    }).catch(console.error);
  }, [selectedSchoolYear, selectedTerm]);

  // ---- Reset subject when class changes ----
  useEffect(() => {
    setSelectedSubjectId("");
  }, [selectedClassId]);

  // ---- Load grade data when class+subject+semester selected ----
  useEffect(() => {
    const fetchGrades = async () => {
      if (!selectedClassId || !selectedSubjectId || !selectedAssignment?.classTeacherSubjectId) {
        setRecords([]); setStudents([]); setGradeRows([]); setGradeItems([]);
        return;
      }
      setIsLoading(true);
      try {
        const semesterValue = selectedTerm === "hk2" ? 2 : 1;
        const [studentsRes, gradeItemsRes, gradesRes] = await Promise.all([
          teacherGradeService.getClassStudents(Number(selectedClassId)),
          teacherGradeService.getGradeItems({ classTeacherSubjectId: selectedAssignment.classTeacherSubjectId, semesterId: semesterValue }),
          teacherGradeService.getStudentSubjectGrades({ classTeacherSubjectId: selectedAssignment.classTeacherSubjectId, semesterId: semesterValue }),
        ]);
        const fetchedStudents = Array.isArray(studentsRes) ? studentsRes : [];
        const fetchedItems = Array.isArray(gradeItemsRes) ? gradeItemsRes : [];
        const fetchedRows = Array.isArray(gradesRes) ? gradesRes : [];
        const itemIds = new Set(fetchedItems.map((i) => String(i.id)));
        const filteredRows = fetchedRows.filter((r) => itemIds.has(String(r.grade_item_id)));
        setStudents(fetchedStudents);
        setGradeItems(fetchedItems);
        setGradeRows(filteredRows);
        setRecords(buildStudentGradeRecords(fetchedStudents, filteredRows, fetchedItems));
      } catch (e) {
        console.error("Fetch grades error:", e);
        toast.error("Lỗi khi tải dữ liệu điểm.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchGrades();
  }, [selectedClassId, selectedSubjectId, selectedTerm]);

  // ---- Lock status ----
  useEffect(() => {
    if (!selectedClassId || !selectedAssignment?.classTeacherSubjectId) return;
    const checkLock = async () => {
      try {
        const res = await dataLockingService.listByModule ? {} : {};
        // Use existing grade lock status from teacherService
        const { teacherService } = await import("../../../services/pages/teacher/teacherService");
        const response = await teacherService.getGradesLockStatus({
          params: { classId: selectedClassId, classTeacherSubjectId: selectedAssignment?.classTeacherSubjectId, schoolYear: selectedSchoolYear, term: selectedTerm },
          mock: false,
        });
        if (response?.success && response?.data) {
          setLockStatus(response.data.status || "draft");
        } else {
          setLockStatus("draft");
        }
      } catch {
        setLockStatus("draft");
      }
    };
    checkLock();
  }, [selectedClassId, selectedSubjectId, selectedSchoolYear, selectedTerm]);

  // ---- Summary stats ----
  const summaryStats = useMemo(() => {
    if (!records.length) return { average: 0, passRate: 0, excellentRate: 0, atRiskCount: 0, atRiskStudents: [] };
    const averages = records.map((r) => r.average).filter((v) => v !== null);
    const totalAvg = averages.length ? averages.reduce((a, b) => a + b, 0) / averages.length : 0;
    const passCount = records.filter((r) => r.average >= 5).length;
    const excellentCount = records.filter((r) => r.average >= 8.5).length;
    const atRiskStudents = records.filter((r) => r.average < 5);
    return {
      average: round1(totalAvg),
      passRate: Math.round((passCount / records.length) * 100),
      excellentRate: Math.round((excellentCount / records.length) * 100),
      atRiskCount: atRiskStudents.length,
      atRiskStudents,
    };
  }, [records]);

  // ---- Class overview data (for tab 2) ----
  const classOverview = useMemo(() => {
    if (!selectedClassId || !isHomeroom) return [];
    return classSubjects.map((a) => ({
      subjectId: a.subjectId,
      subjectName: a.subjectName,
      semesterId: a.semesterId,
      semesterName: a.semesterName,
    }));
  }, [selectedClassId, classSubjects, isHomeroom]);

  // ---- Handlers ----
  const openEditDialog = (record) => {
    setEditStudentId(record.id);
    setEditDraft({
      regularScores: (record.regularScores || []).length
        ? record.regularScores.map((r) => ({ score: String(r.score ?? ""), gradeItemId: r.gradeItemId }))
        : [{ score: "", gradeItemId: null }],
      midterm: { score: String(record.midtermScore ?? ""), gradeItemId: record.midtermGradeItemId || null },
      final: { score: String(record.finalScore ?? ""), gradeItemId: record.finalGradeItemId || null },
      note: record.note || "",
    });
    setEditDialogOpen(true);
  };

  const handleSaveGrade = async () => {
    try {
      const semesterValue = selectedTerm === "hk2" ? 2 : 1;
      const payload = {
        classTeacherSubjectId: selectedAssignment?.classTeacherSubjectId,
        semesterId: semesterValue,
        studentEnrollmentId: editStudentId,
        regularScores: editDraft.regularScores.map((v) => ({ score: v.score, gradeItemId: v.gradeItemId })),
        midterm: { score: editDraft.midterm.score, gradeItemId: editDraft.midterm.gradeItemId },
        final: { score: editDraft.final.score, gradeItemId: editDraft.final.gradeItemId },
        note: editDraft.note,
      };
      const { teacherService } = await import("../../../services/pages/teacher/teacherService");
      const res = await teacherService.teacherUpsertGrades({ body: payload, mock: false });
      if (res && res.success) {
        toast.success("Đã cập nhật điểm thành công!");
        setEditDialogOpen(false);
        const [studentsRes, gradeItemsRes, gradesRes] = await Promise.all([
          teacherGradeService.getClassStudents(Number(selectedClassId)),
          teacherGradeService.getGradeItems({ classTeacherSubjectId: selectedAssignment.classTeacherSubjectId, semesterId: semesterValue }),
          teacherGradeService.getStudentSubjectGrades({ classTeacherSubjectId: selectedAssignment.classTeacherSubjectId, semesterId: semesterValue }),
        ]);
        const fetchedStudents = Array.isArray(studentsRes) ? studentsRes : [];
        const fetchedItems = Array.isArray(gradeItemsRes) ? gradeItemsRes : [];
        const fetchedRows = Array.isArray(gradesRes) ? gradesRes : [];
        const itemIds = new Set(fetchedItems.map((i) => String(i.id)));
        const filteredRows = fetchedRows.filter((r) => itemIds.has(String(r.grade_item_id)));
        setStudents(fetchedStudents);
        setGradeItems(fetchedItems);
        setGradeRows(filteredRows);
        setRecords(buildStudentGradeRecords(fetchedStudents, filteredRows, fetchedItems));
      } else {
        toast.error("Lỗi khi lưu điểm: " + (res?.error || ""));
      }
    } catch (e) {
      console.error("Save grade error:", e);
      toast.error("Lỗi khi lưu điểm.");
    }
  };

  const handleLockGrades = async () => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn khóa điểm môn học này?");
    if (!confirmed) return;
    try {
      const semesterValue = selectedTerm === "hk2" ? 2 : 1;
      const { teacherService } = await import("../../../services/pages/teacher/teacherService");
      const res = await teacherService.finalizeClassGrades({
        body: { classId: selectedClassId, classTeacherSubjectId: selectedAssignment?.classTeacherSubjectId, schoolYear: selectedSchoolYear, term: selectedTerm, status: "locked" },
        mock: false,
      });
      if (res?.success) { setLockStatus("locked"); toast.success("Đã khóa điểm!"); }
      else toast.error("Không thể khóa điểm.");
    } catch { toast.error("Lỗi khi khóa điểm."); }
  };

  const handleSendUnlockRequest = () => {
    if (!unlockReason.trim()) { toast.warning("Nhập lý do yêu cầu mở khóa."); return; }
    toast.success("Yêu cầu đã được gửi!");
    setUnlockRequestOpen(false);
  };

  // ---- Student detail ----
  const handleOpenStudentDetail = async (student) => {
    setStudentDetail({ student, loading: true });
    setIsLoadingDetail(true);
    try {
      const enrollmentId = student.enrollmentId || student.id;
      const results = [];
      const taughtAssignments = classSubjects.filter((a) => String(a.classId) === String(selectedClassId));

      for (const assignment of taughtAssignments) {
        const semesterValue = assignment.semesterId || (assignment.semesterName?.toLowerCase().includes("2") ? 2 : 1);
        try {
          const grades = await teacherGradeService.getStudentSubjectGrades({
            enrollmentId,
            classTeacherSubjectId: assignment.classTeacherSubjectId,
            semesterId: semesterValue,
          });
          const rows = Array.isArray(grades) ? grades : [];
          const regularNums = rows.filter((r) => normalizeGradeCategory(r.category_name || "", r.grade_item_name || "") === "regular").map((r) => toScoreNumber(r.score)).filter((v) => v !== null);
          const midtermRow = rows.find((r) => normalizeGradeCategory(r.category_name || "", r.grade_item_name || "") === "midterm");
          const finalRow = rows.find((r) => normalizeGradeCategory(r.category_name || "", r.grade_item_name || "") === "final");
          const denom = regularNums.length + (midtermRow ? 2 : 0) + (finalRow ? 3 : 0);
          const avg = denom ? round1((regularNums.reduce((a, b) => a + b, 0) + (midtermRow ? toScoreNumber(midtermRow.score) * 2 : 0) + (finalRow ? toScoreNumber(finalRow.score) * 3 : 0)) / denom) : null;
          results.push({ subjectName: assignment.subjectName, semesterName: assignment.semesterName, average: avg });
        } catch { results.push({ subjectName: assignment.subjectName, semesterName: assignment.semesterName, average: null }); }
      }

      setStudentDetail({
        student,
        subjects: results,
        loading: false,
      });
    } catch (e) {
      console.error(e);
      toast.error("Lỗi khi tải chi tiết học sinh.");
      setStudentDetail(null);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const currentClass = teacherClasses.find((c) => String(c.id) === String(selectedClassId)) || {};
  const currentSubject = classSubjects.find((a) => String(a.subjectId) === String(selectedSubjectId)) || {};
  const semesterLabel = SEMESTERS[selectedTerm]?.label || selectedTerm;

  return (
    <div className="teacher-grades-page">
      <PageHeader
        title="Quản lý điểm học sinh"
        eyebrow={currentClass.name ? `Lớp: ${currentClass.name} | Môn: ${currentSubject.subjectName || "---"}` : "Chọn lớp và môn học"}
        actions={<SchoolYearTermSelector selectedSchoolYear={selectedSchoolYear} selectedTerm={selectedTerm} onYearChange={handleYearArrow} onTermChange={handleTermChange} />}
      />

      {/* Filter Bar */}
      <div className="tg-filter-bar">
        <Select
          className="tg-select"
          variant="custom"
          label="Lớp"
          value={selectedClassId}
          options={teacherClasses.map((c) => ({ value: c.id, label: `${c.name}${c.role === "homeroom" ? " (GVCN)" : ""}` }))}
          onChange={(e) => setSelectedClassId(e.target.value)}
          searchable
        />
        <Select
          className="tg-select"
          variant="custom"
          label="Môn học"
          value={selectedSubjectId}
          options={classSubjects.map((a) => ({ value: a.subjectId, label: a.subjectName }))}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          searchable
        />
        <div className="tg-lock-controls">
          <span className={`grade-lock-status-badge ${lockStatus === "locked" ? "is-locked" : "is-draft"}`}>
            {lockStatus === "locked" ? <><FiLock style={{ marginRight: 6 }} /> Đã khóa</> : <><FiUnlock style={{ marginRight: 6 }} /> Bản nháp</>}
          </span>
          {lockStatus === "locked" ? (
            <button className="teacher-grades-action-btn is-unlock-request" onClick={() => { setUnlockReason(""); setUnlockRequestOpen(true); }}>
              <FiSend style={{ marginRight: 6 }} /> Yêu cầu mở khóa
            </button>
          ) : (
            <button className="teacher-grades-action-btn is-lock" onClick={handleLockGrades} disabled={!selectedClassId || !selectedSubjectId || isHomeroom}>
              <FiLock style={{ marginRight: 6 }} /> Khóa điểm
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tg-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tg-tab ${activeTab === tab.key ? "is-active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "gradebook" && (
        <div className="tg-tab-content">
          {selectedClassId && selectedSubjectId ? (
            <>
              <div className="teacher-grades-top-panel">
                <div className="teacher-grades-summary-header">
                  <GradeSummaryHeader subjectLabel={currentSubject.subjectName} />
                </div>
                <div className="teacher-grades-summary-row">
                  <GradeSummarySection stats={summaryStats} onOpenAtRisk={() => setAtRiskDialogOpen(true)} />
                </div>
              </div>
              {isLoading ? (
                <div className="teacher-grades-loading">
                  <div className="spinner"></div><p>Đang tải dữ liệu điểm số...</p>
                </div>
              ) : (
                <div className="teacher-grades-grid">
                  <GradeListSection
                    records={records}
                    onOpenEditDialog={openEditDialog}
                    subjectLabel={currentSubject.subjectName}
                    semesterLabel={semesterLabel}
                    isLocked={lockStatus === "locked"}
                    canEdit={lockStatus !== "locked"}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="tg-empty-hint">Vui lòng chọn lớp và môn học để xem sổ điểm.</div>
          )}
        </div>
      )}

      {activeTab === "overview" && (
        <div className="tg-tab-content">
          {!isHomeroom ? (
            <div className="tg-empty-hint">Bạn không phải là GVCN. Tổng quan lớp chỉ dành cho giáo viên chủ nhiệm.</div>
          ) : !selectedClassId ? (
            <div className="tg-empty-hint">Vui lòng chọn lớp để xem tổng quan.</div>
          ) : (
            <div className="tg-overview-grid">
              <table className="tg-overview-table">
                <thead>
                  <tr>
                    <th>Môn học</th>
                    <th className="text-center">HKI</th>
                    <th className="text-center">HKII</th>
                    <th className="text-center">Cả năm</th>
                  </tr>
                </thead>
                <tbody>
                  {classSubjects.length === 0 ? (
                    <tr><td colSpan={4} className="tg-empty-state">Chưa có dữ liệu môn học.</td></tr>
                  ) : (
                    classSubjects.map((a) => (
                      <tr
                        key={`${a.subjectId}-${a.semesterId}`}
                        className="tg-overview-row"
                        onClick={() => {
                          setSelectedSubjectId(a.subjectId);
                          setActiveTab("gradebook");
                        }}
                      >
                        <td>{a.subjectName}</td>
                        <td className="text-center">{a.semesterName?.toLowerCase().includes("1") ? "—" : ""}</td>
                        <td className="text-center">{a.semesterName?.toLowerCase().includes("2") ? "—" : ""}</td>
                        <td className="text-center">—</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "students" && (
        <div className="tg-tab-content">
          {!selectedClassId ? (
            <div className="tg-empty-hint">Vui lòng chọn lớp để xem danh sách học sinh.</div>
          ) : isLoading ? (
            <div className="teacher-grades-loading"><div className="spinner"></div><p>Đang tải danh sách...</p></div>
          ) : students.length === 0 ? (
            <div className="tg-empty-hint">Không có học sinh trong lớp này.</div>
          ) : (
            <div className="tg-students-list">
              <table className="tg-students-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Mã HS</th>
                    <th>Họ và tên</th>
                    <th className="text-center">Điểm TB</th>
                    <th className="text-center">Xếp loại</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const rec = records.find((r) => String(r.enrollmentId) === String(s.enrollment_id || s.id));
                    const avg = rec?.average ?? 0;
                    return (
                      <tr key={s.enrollment_id || s.id}>
                        <td>{i + 1}</td>
                        <td>{s.student_code || s.code || `HS${s.enrollment_id || s.id}`}</td>
                        <td className="bold">{s.full_name || s.name || "—"}</td>
                        <td className="text-center bold">{avg > 0 ? fmtScore(avg) : "—"}</td>
                        <td className="text-center">
                          <span className={`grade-list-rank rank-${rec?.rank || "average"}`}>
                            {rec ? { excellent: "Xuất sắc", good: "Tốt", fair: "Khá", average: "Trung bình", weak: "Yếu" }[rec.rank] || rec.rank : "—"}
                          </span>
                        </td>
                        <td className="text-center">
                          <button className="tg-detail-btn" onClick={() => handleOpenStudentDetail(s)}>
                            <FiUser style={{ marginRight: 4 }} /> Chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Grade Modal */}
      <Modal open={editDialogOpen} title={editStudentId ? `Chỉnh sửa điểm — ${records.find((r) => r.id === editStudentId)?.name}` : "Chỉnh sửa điểm"} onClose={() => setEditDialogOpen(false)} className="teacher-grade-edit-modal">
        <div className="teacher-grade-edit-form">
          <div className="teacher-grade-edit-meta">
            <span>{currentClass.name}</span><span>{currentSubject.subjectName}</span><span>{semesterLabel}</span>
          </div>
          <div className="grade-entry-score-block">
            <div className="grade-entry-score-block__head">
              <span>Điểm thường xuyên</span>
              <button className="grade-entry-score-add-btn" disabled={!canEdit} onClick={() => setEditDraft((p) => ({ ...p, regularScores: [...p.regularScores, { score: "", gradeItemId: null }] }))}>
                <FiPlus />
              </button>
            </div>
            <div className="grade-entry-score-grid">
              {editDraft.regularScores.map((val, idx) => (
                <div key={`r-${idx}`} className="grade-entry-field">
                  <div className="grade-entry-field__label">
                    <span>TX {idx + 1}</span>
                    {editDraft.regularScores.length > 1 && (
                      <button className="grade-entry-delete-btn" disabled={!canEdit} onClick={() => setEditDraft((p) => ({ ...p, regularScores: p.regularScores.filter((_, i) => i !== idx) }))}><FiTrash2 /></button>
                    )}
                  </div>
                  <input type="number" step="0.1" min="0" max="10" readOnly={!canEdit} style={{ background: canEdit ? '' : '#f1f5f9', cursor: canEdit ? '' : 'not-allowed' }} value={val.score} onChange={(e) => {
                    setEditDraft((p) => ({ ...p, regularScores: p.regularScores.map((r, i) => i === idx ? { ...r, score: e.target.value } : r) }));
                  }} />
                </div>
              ))}
            </div>
          </div>
          <div className="teacher-grade-edit-grid">
            <div className="teacher-grade-edit-note"><span>Giữa kỳ</span><input type="number" step="0.1" min="0" max="10" readOnly={!canEdit} style={{ background: canEdit ? '' : '#f1f5f9', cursor: canEdit ? '' : 'not-allowed' }} value={editDraft.midterm.score} onChange={(e) => setEditDraft((p) => ({ ...p, midterm: { ...p.midterm, score: e.target.value } }))} /></div>
            <div className="teacher-grade-edit-note"><span>Cuối kỳ</span><input type="number" step="0.1" min="0" max="10" readOnly={!canEdit} style={{ background: canEdit ? '' : '#f1f5f9', cursor: canEdit ? '' : 'not-allowed' }} value={editDraft.final.score} onChange={(e) => setEditDraft((p) => ({ ...p, final: { ...p.final, score: e.target.value } }))} /></div>
          </div>
          <div className="teacher-grade-edit-note"><span>Ghi chú</span><textarea rows="3" readOnly={!canEdit} style={{ background: canEdit ? '' : '#f1f5f9', cursor: canEdit ? '' : 'not-allowed' }} value={editDraft.note} onChange={(e) => setEditDraft((p) => ({ ...p, note: e.target.value }))} placeholder="Nhận xét..." /></div>
          <div className="teacher-grade-edit-actions">
            <button className="teacher-grade-edit-btn is-ghost" onClick={() => setEditDialogOpen(false)}><FiX /> Hủy</button>
            <button className="teacher-grade-edit-btn is-primary" disabled={!canEdit} onClick={handleSaveGrade}><FiSave /> Lưu thay đổi</button>
          </div>
        </div>
      </Modal>

      {/* At Risk Modal */}
      <Modal open={atRiskDialogOpen} title={`Học sinh cảnh báo (${summaryStats.atRiskCount})`} onClose={() => setAtRiskDialogOpen(false)} className="teacher-grade-risk-modal">
        <div className="teacher-grade-risk-list">
          {summaryStats.atRiskStudents.map((s) => (
            <div key={s.id} className={`teacher-grade-risk-item ${lockStatus === "locked" ? "is-locked-cursor" : ""}`} onClick={() => { if (lockStatus !== "locked" && canEdit) { setAtRiskDialogOpen(false); openEditDialog(s); } }}>
              <div><strong>{s.name}</strong><span>{s.code}</span></div>
              <small>TB: {s.average}</small>
            </div>
          ))}
          {summaryStats.atRiskCount === 0 && <p style={{ textAlign: "center", padding: 20, color: "#64748b" }}>Không có học sinh bị cảnh báo.</p>}
        </div>
      </Modal>

      {/* Unlock Request Modal */}
      <Modal open={unlockRequestOpen} title="Yêu cầu mở khóa chỉnh sửa điểm" onClose={() => setUnlockRequestOpen(false)} className="teacher-grade-unlock-request-modal">
        <div className="teacher-grade-edit-form">
          <div className="teacher-grade-edit-meta">
            <span>{currentClass.name}</span><span>{currentSubject.subjectName}</span><span>{semesterLabel}</span>
          </div>
          <div className="teacher-grade-edit-note">
            <span>Lý do yêu cầu mở khóa</span>
            <textarea rows="4" value={unlockReason} onChange={(e) => setUnlockReason(e.target.value)} placeholder="Nhập lý do chi tiết để Ban giám hiệu xem xét..." />
          </div>
          <div className="teacher-grade-edit-actions">
            <button className="teacher-grade-edit-btn is-ghost" onClick={() => setUnlockRequestOpen(false)}><FiX /> Hủy</button>
            <button className="teacher-grade-edit-btn is-primary" onClick={handleSendUnlockRequest}><FiSend /> Gửi yêu cầu</button>
          </div>
        </div>
      </Modal>

      {/* Student Detail Modal */}
      <Modal
        open={!!studentDetail}
        title={studentDetail ? `Học bạ — ${studentDetail.student?.full_name || studentDetail.student?.name || "—"}` : ""}
        onClose={() => setStudentDetail(null)}
        className="tg-student-detail-modal"
      >
        <div className="tg-student-detail-body">
          {isLoadingDetail ? (
            <div className="teacher-grades-loading"><div className="spinner"></div><p>Đang tải học bạ...</p></div>
          ) : studentDetail?.subjects?.length > 0 ? (
            <>
              <div className="tg-student-specs">
                <span><strong>Học sinh:</strong> {studentDetail.student?.full_name || studentDetail.student?.name || "—"}</span>
                <span><strong>Lớp:</strong> {currentClass.name}</span>
              </div>
              <table className="tg-detail-table">
                <thead>
                  <tr>
                    <th>Môn học</th>
                    <th className="text-center">HKI</th>
                    <th className="text-center">HKII</th>
                    <th className="text-center">Cả năm</th>
                  </tr>
                </thead>
                <tbody>
                  {studentDetail.subjects.map((sub, i) => {
                    const isHK1 = sub.semesterName?.toLowerCase().includes("1");
                    const existing = studentDetail.subjects.find((s2, j) => j > i && s2.subjectName === sub.subjectName && s2.semesterName?.toLowerCase().includes("2"));
                    const hk1 = isHK1 ? sub.average : existing?.average;
                    const hk2 = isHK1 ? existing?.average : sub.average;
                    const yearAvg = hk1 != null && hk2 != null ? round1((hk1 + 2 * hk2) / 3) : hk2 ?? hk1;
                    if (isHK1) return null;
                    return (
                      <tr key={`${sub.subjectName}-${i}`}>
                        <td className="bold">{sub.subjectName}</td>
                        <td className="text-center">{fmtScore(hk1)}</td>
                        <td className="text-center">{fmtScore(hk2)}</td>
                        <td className="text-center bold success">{fmtScore(yearAvg)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="tg-detail-formula">Công thức cả năm: <strong>(ĐTB HKI + 2 × ĐTB HKII) / 3</strong></p>
            </>
          ) : (
            <p className="tg-empty-state">Chưa có dữ liệu học tập.</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
