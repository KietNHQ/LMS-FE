import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../../components/ui/Modal/Modal";
import { Select } from "../../../components/ui";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { teacherGradeService } from "../../../services/pages/teacher/teacherGradeService";
import { gradeService } from "../../../services/pages/management/grades/gradeService";
import { dataLockingService } from "../../../services/pages/admin/locking/dataLockingService";
import { resolveSemesterId, resolveSchoolYearId } from "../../../services/shared/schoolYearLookup";
import GradeListSection from "./components/gradeListSection/GradeListSection";
import { FiPlus, FiSave, FiX, FiTrash2, FiLock, FiUnlock, FiSend, FiUser } from "react-icons/fi";
import GradeSummarySection, { GradeSummaryHeader } from "./components/gradeSummarySection/GradeSummarySection";
import { toast } from "react-toastify";
import "./TeacherGrades.css";

const SEMESTERS = { hk1: { label: "Học kỳ 1" }, hk2: { label: "Học kỳ 2" } };
const TABS = [
  { key: "gradebook", label: "Sổ điểm" },
  { key: "students", label: "Học sinh" },
];

function round1(value) {
  if (value == null || isNaN(value)) return 0;
  return Math.round(value * 10) / 10;
}

function getRank(average) {
  if (average >= 8.0) return "excellent";
  if (average >= 6.5) return "good";
  if (average >= 5.0) return "fair";
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
  const navigate = useNavigate();

  const currentUserId = useMemo(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
    return storedUser.profile?.id || storedUser.teacherId || storedUser.id || null;
  }, []);

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
  const [retractedGradeId, setRetractedGradeId] = useState(null);
  const [isRetracting, setIsRetracting] = useState(false);
  const [lockStatus, setLockStatus] = useState("draft");

  const [studentSemesterAverages, setStudentSemesterAverages] = useState({});
  const [studentConducts, setStudentConducts] = useState({});
  const fetchStudentExtrasInFlight = useRef(false);

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
    const result = Object.values(map);
    return result;
  }, [assignments]);

  // Class where current user is homeroom teacher (can view all subjects)
  const homeroomClassId = useMemo(() => {
    const hrClass = teacherClasses.find((c) => c.role === "homeroom");
    return hrClass?.id ? String(hrClass.id) : null;
  }, [teacherClasses]);

  const classSubjects = useMemo(() => {
    if (!selectedClassId) return [];
    const filtered = assignments.filter((a) => String(a.classId) === String(selectedClassId));
    // Deduplicate by subjectId: keep the entry WITH classTeacherSubjectId (teaching)
    // over the homeroom-only entry (which has no classTeacherSubjectId)
    const seen = {};
    for (const a of filtered) {
      const prev = seen[a.subjectId];
      if (!prev || (a.classTeacherSubjectId && !prev.classTeacherSubjectId)) {
        seen[a.subjectId] = a;
      }
    }
    return Object.values(seen);
  }, [assignments, selectedClassId]);

  const selectedAssignment = useMemo(() => {
    return classSubjects.find((a) => String(a.subjectId) === String(selectedSubjectId));
  }, [classSubjects, selectedSubjectId]);

  // ---- Reset selections on year/term change ----
  useEffect(() => {
    setSelectedClassId("");
    setSelectedSubjectId("");
  }, [selectedSchoolYear, selectedTerm]);

  const canEdit = useMemo(() => {
    if (lockStatus === "locked" || lockStatus === "pending") return false;
    if (!selectedAssignment) return false;
    return !!selectedAssignment.classTeacherSubjectId;
  }, [lockStatus, selectedAssignment]);

  // ---- Load assignments when schoolYear/term changes ----
  useEffect(() => {
    teacherGradeService.getMyAssignments({ schoolYear: selectedSchoolYear, term: selectedTerm }).then((res) => {
      const assignmentsArray = Array.isArray(res) ? res : (res?.data || []);
      const mapped = assignmentsArray.map((a) => ({
        ...a,
        classId: a.class_id,
        className: a.class_name,
        subjectId: a.subject_id,
        subjectName: a.subject_name,
        semesterId: a.semester_id,
        semesterName: a.semester_name,
        classTeacherSubjectId: a.class_teacher_subject_id,
        role: a.role,
      }));
      setAssignments(mapped);
    }).catch(console.error);
  }, [selectedSchoolYear, selectedTerm]);

  // ---- Reset subject when class changes ----
  useEffect(() => {
    setSelectedSubjectId("");
  }, [selectedClassId]);

  // ---- Load grade data when class+subject+semester selected ----
  useEffect(() => {
    const fetchGrades = async () => {
      if (!selectedClassId || !selectedSubjectId) {
        setRecords([]); setGradeRows([]); setGradeItems([]);
        return;
      }
      const semesterDbId = await resolveSemesterId(selectedSchoolYear, selectedTerm);
      if (!semesterDbId) {
        setRecords([]); setGradeRows([]); setGradeItems([]);
        setIsLoading(false);
        return;
      }

      if (!selectedAssignment?.classTeacherSubjectId) {
        // GVCN viewing a subject they don't teach in their homeroom class — read-only
        setIsLoading(true);
        try {
          const [studentsRes, homeroomRes] = await Promise.all([
            teacherGradeService.getClassStudents(Number(selectedClassId)),
            teacherGradeService.getHomeroomClassGrades({
              classId: selectedClassId,
              subjectId: selectedSubjectId,
              semesterId: semesterDbId,
            }),
          ]);
          const fetchedStudents = Array.isArray(studentsRes) ? studentsRes : [];
          const { gradeItems: fetchedItems = [], grades: fetchedRows = [] } = homeroomRes || {};
          const itemIds = new Set(fetchedItems.map((i) => String(i.id)));
          const filteredRows = fetchedRows.filter((r) => itemIds.has(String(r.grade_item_id)));
          setStudents(fetchedStudents);
          setGradeItems(fetchedItems);
          setGradeRows(filteredRows);
          setRecords(buildStudentGradeRecords(fetchedStudents, filteredRows, fetchedItems));
        } catch (e) {
          console.error("Fetch homeroom grades error:", e);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // Normal path: teacher with classTeacherSubjectId
      setIsLoading(true);
      try {
        const [studentsRes, gradeItemsRes, gradesRes] = await Promise.all([
          teacherGradeService.getClassStudents(Number(selectedClassId)),
          teacherGradeService.getGradeItems({ classTeacherSubjectId: selectedAssignment.classTeacherSubjectId, semesterId: semesterDbId }),
          teacherGradeService.getStudentSubjectGrades({ classTeacherSubjectId: selectedAssignment.classTeacherSubjectId, semesterId: semesterDbId }),
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

  // ---- Load class students when students tab is active (for homeroom subjects or any class) ----
  useEffect(() => {
    if (activeTab !== "students") return;
    if (!selectedClassId) return;
    // Already have students from fetchGrades or from class switch
    if (students.length > 0) return;
    // Load students for this class
    teacherGradeService.getClassStudents(Number(selectedClassId))
      .then((res) => setStudents(Array.isArray(res) ? res : []))
      .catch(() => setStudents([]));
  }, [activeTab, selectedClassId, students.length]);

  // ---- Fetch HK1/HK2 averages + conduct for all students when class changes ----
  useEffect(() => {
    if (!selectedClassId) return;
    if (fetchStudentExtrasInFlight.current) return;
    const fetchStudentExtras = async () => {
      // Fetch students fresh to avoid stale closure
      const fetchedStudents = await teacherGradeService.getClassStudents(Number(selectedClassId));
      const freshStudents = Array.isArray(fetchedStudents) ? fetchedStudents : [];
      if (!freshStudents.length) {
        fetchStudentExtrasInFlight.current = false;
        return;
      }
      setStudents(freshStudents);

      const schoolYearId = await resolveSchoolYearId(selectedSchoolYear);

      const hk1SemesterId = await resolveSemesterId(selectedSchoolYear, "hk1");
      const hk2SemesterId = await resolveSemesterId(selectedSchoolYear, "hk2");
      const hk1SemesterIdStr = String(hk1SemesterId || "");
      const hk2SemesterIdStr = String(hk2SemesterId || "");

      const newAverages = {};
      const newConducts = {};

      const studentGPAPromises = freshStudents.map(async (student) => {
        const enrollmentId = student.enrollment_id || student.id;
        const [hk1Res, hk2Res] = await Promise.all([
          gradeService.calculateSemesterGPA({ enrollmentId, semesterId: 1, schoolYearId }).catch(() => null),
          gradeService.calculateSemesterGPA({ enrollmentId, semesterId: 2, schoolYearId }).catch(() => null),
        ]);
        const hk1GPA = hk1Res?.gpa != null ? round1(hk1Res.gpa) : null;
        const hk2GPA = hk2Res?.gpa != null ? round1(hk2Res.gpa) : null;
        const yearAvg = hk1GPA !== null && hk2GPA !== null
          ? round1((hk1GPA + 2 * hk2GPA) / 3)
          : hk2GPA ?? hk1GPA;
        return { enrollmentId, hk1GPA, hk2GPA, yearAvg };
      });

      // Gather GPA results
      const gpaResults = await Promise.all(studentGPAPromises);
      for (const r of gpaResults) {
        newAverages[r.enrollmentId] = { hk1: r.hk1GPA, hk2: r.hk2GPA, year: r.yearAvg };
      }

      // Conduct: try class-level summary endpoint first (only for specific semester),
      // fall back to per-student classifySemester.
      // In "all" term, skip class-level (requires both HK1+HK2 IDs) and go per-student.
      let conductMap = {};
      if (hk1SemesterId || hk2SemesterId) {
        const isAllTerm = selectedTerm === "all";
        try {
          const axiosClient = (await import("../../../services/shared/http/axiosClient")).default;
          const params = {};
          if (hk1SemesterIdStr) params.hk1SemesterId = hk1SemesterIdStr;
          if (hk2SemesterIdStr) params.hk2SemesterId = hk2SemesterIdStr;
          const resp = await axiosClient.get("/conduct-summary/class/" + selectedClassId + "/summary", { params });
          const conductRows = resp?.data?.students || [];
          for (const row of conductRows) {
            const eid = String(row.enrollmentId || row.enrollment_id);
            if (eid) {
              conductMap[eid] = {
                hk1: row.hk1Level || null,
                hk2: row.hk2Level || null,
                year: row.annualLevel || null,
              };
            }
          }
        } catch {
          // class-level endpoint failed (403 / not found) — fall through to per-student
          conductMap = {};
        }
      }

      // Per-student classifySemester fallback
      if (Object.keys(conductMap).length === 0) {
        const conductPromises = freshStudents.map(async (student) => {
          const enrollmentId = String(student.enrollment_id || student.id);
          try {
            const [hk1Res, hk2Res] = await Promise.all([
              gradeService.classifySemester({ enrollmentId, semesterId: 1 }).catch(() => null),
              gradeService.classifySemester({ enrollmentId, semesterId: 2 }).catch(() => null),
            ]);
            conductMap[enrollmentId] = {
              hk1: hk1Res?.data?.conduct?.level || hk1Res?.description || null,
              hk2: hk2Res?.data?.conduct?.level || hk2Res?.description || null,
            };
          } catch {
            conductMap[enrollmentId] = { hk1: null, hk2: null };
          }
        });
        await Promise.all(conductPromises);
      }

      for (const student of freshStudents) {
        const eid = String(student.enrollment_id || student.id);
        if (!newConducts[eid]) {
          newConducts[eid] = conductMap[eid] || { hk1: null, hk2: null };
        }
      }

      setStudentSemesterAverages(newAverages);
      setStudentConducts(newConducts);
      fetchStudentExtrasInFlight.current = false;
    };
    fetchStudentExtrasInFlight.current = true;
    fetchStudentExtras().catch(() => { fetchStudentExtrasInFlight.current = false; });
  }, [selectedClassId, selectedSchoolYear]);

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
    const excellentCount = records.filter((r) => r.average >= 8.0).length;
    const atRiskStudents = records.filter((r) => r.average < 5);
    return {
      average: round1(totalAvg),
      passRate: Math.round((passCount / records.length) * 100),
      excellentRate: Math.round((excellentCount / records.length) * 100),
      atRiskCount: atRiskStudents.length,
      atRiskStudents,
    };
  }, [records]);

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
      const semesterDbId = await resolveSemesterId(selectedSchoolYear, selectedTerm);
      if (!semesterDbId) { toast.error("Không tìm thấy học kỳ."); return; }
      const payload = {
        classTeacherSubjectId: selectedAssignment?.classTeacherSubjectId,
        semesterId: semesterDbId,
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
          teacherGradeService.getGradeItems({ classTeacherSubjectId: selectedAssignment.classTeacherSubjectId, semesterId: semesterDbId }),
          teacherGradeService.getStudentSubjectGrades({ classTeacherSubjectId: selectedAssignment.classTeacherSubjectId, semesterId: semesterDbId }),
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
      const confirmed = window.confirm("Bạn có chắc chắn muốn nộp điểm để phê duyệt?");
    if (!confirmed) return;
    try {
      const semesterDbId = await resolveSemesterId(selectedSchoolYear, selectedTerm);
      if (!semesterDbId) { toast.error("Không tìm thấy học kỳ."); return; }
      const { teacherService } = await import("../../../services/pages/teacher/teacherService");
      const res = await teacherService.submitBatchGrades({
        body: { classId: selectedClassId, classTeacherSubjectId: selectedAssignment?.classTeacherSubjectId, semesterId: semesterDbId },
        mock: false,
      });
      if (res?.success) {
        setLockStatus("pending");
        toast.success(`Đã nộp ${res.data?.submittedCount || 0} điểm để phê duyệt!`);
      }
      else toast.error(res?.error || "Không thể nộp điểm.");
    } catch { toast.error("Lỗi khi nộp điểm."); }
  };

  const handleSendUnlockRequest = async () => {
    if (!unlockReason.trim()) { toast.warning("Nhập lý do yêu cầu mở khóa."); return; }
    if (!retractedGradeId) { toast.error("Không tìm thấy thông tin điểm để mở khóa."); return; }

    setIsRetracting(true);
    try {
      const semesterDbId = await resolveSemesterId(selectedSchoolYear, selectedTerm);
      const { teacherService } = await import("../../../services/pages/teacher/teacherService");
      const res = await teacherService.retractGrade({
        pathParams: { id: retractedGradeId },
        body: { notes: unlockReason },
        mock: false,
      });
      if (res?.success) {
        toast.success("Yêu cầu mở khóa đã được gửi!");
        setUnlockRequestOpen(false);
        setLockStatus("draft");
      } else {
        toast.error("Không thể gửi yêu cầu: " + (res?.message || "Lỗi không xác định"));
      }
    } catch (e) {
      console.error("Retract grade error:", e);
      toast.error("Lỗi khi gửi yêu cầu mở khóa.");
    } finally {
      setIsRetracting(false);
    }
  };

  // ---- Student detail ----
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
          <span className={`grade-lock-status-badge ${lockStatus === "pending" || lockStatus === "locked" ? "is-locked" : "is-draft"}`}>
            {lockStatus === "pending" ? <><FiLock style={{ marginRight: 6 }} /> Đã nộp (chờ duyệt)</> : lockStatus === "locked" ? <><FiLock style={{ marginRight: 6 }} /> Đã khóa</> : <><FiUnlock style={{ marginRight: 6 }} /> Bản nháp</>}
          </span>
          {(lockStatus === "pending" || lockStatus === "locked") ? (
            <button className="teacher-grades-action-btn is-unlock-request" onClick={() => { setUnlockReason(""); setRetractedGradeId(selectedAssignment?.classTeacherSubjectId); setUnlockRequestOpen(true); }}>
              <FiSend style={{ marginRight: 6 }} /> Yêu cầu mở khóa
            </button>
          ) : (
            <button className="teacher-grades-action-btn is-lock" onClick={handleLockGrades} disabled={!canEdit}>
              <FiSend style={{ marginRight: 6 }} /> Nộp điểm
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
                    isLocked={lockStatus === "locked" || lockStatus === "pending"}
                    canEdit={canEdit}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="tg-empty-hint">Vui lòng chọn lớp và môn học để xem sổ điểm.</div>
          )}
        </div>
      )}

      {activeTab === "students" && (
        <div className="tg-tab-content">
          {!selectedClassId ? (
            <div className="tg-empty-hint">Vui lòng chọn lớp để xem danh sách học sinh.</div>
          ) : String(selectedClassId) !== homeroomClassId ? (
            <div className="tg-empty-hint">Bạn không phải GVCN lớp này.</div>
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
                    <th className="text-center">HK1</th>
                    <th className="text-center">HK2</th>
                    <th className="text-center">Cả năm</th>
                    <th className="text-center">Hạnh kiểm</th>
                    <th className="text-center">Xếp loại</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const enrollmentId = String(s.enrollment_id || s.id);
                    const rec = records.find((r) => String(r.enrollmentId) === enrollmentId);
                    const avg = rec?.average ?? 0;
                    const extras = studentSemesterAverages[enrollmentId] || {};
                    const conducts = studentConducts[enrollmentId] || {};
                    const yearAvg = extras.year ?? avg;
                    const semesterRank = yearAvg >= 8.0 ? "Giỏi" : yearAvg >= 6.5 ? "Khá" : yearAvg >= 5.0 ? "Trung bình" : yearAvg > 0 ? "Yếu" : null;
                    const rankKey = yearAvg >= 8.0 ? "excellent" : yearAvg >= 6.5 ? "good" : yearAvg >= 5.0 ? "fair" : "weak";
                    const conductLabel = (conducts.hk2 || conducts.hk1) || null;
                    return (
                      <tr key={enrollmentId}>
                        <td>{i + 1}</td>
                        <td>{s.student_code || s.code || `HS${enrollmentId}`}</td>
                        <td className="bold">{s.full_name || s.name || "—"}</td>
                        <td className="text-center">{extras.hk1 != null ? fmtScore(extras.hk1) : "—"}</td>
                        <td className="text-center">{extras.hk2 != null ? fmtScore(extras.hk2) : "—"}</td>
                        <td className="text-center bold">{yearAvg > 0 ? fmtScore(yearAvg) : "—"}</td>
                        <td className="text-center">{conductLabel || "—"}</td>
                        <td className="text-center">
                          <span className={`grade-list-rank rank-${rec?.rank || rankKey}`}>
                            {semesterRank || "—"}
                          </span>
                        </td>
                        <td className="text-center">
                          <button className="tg-detail-btn" onClick={() => navigate(`/teacher/grades/student/${enrollmentId}`)}>
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
            <div key={s.id} className={`teacher-grade-risk-item ${lockStatus === "locked" || lockStatus === "pending" ? "is-locked-cursor" : ""}`} onClick={() => { if (lockStatus !== "locked" && lockStatus !== "pending" && canEdit) { setAtRiskDialogOpen(false); openEditDialog(s); } }}>
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
            <button className="teacher-grade-edit-btn is-primary" disabled={isRetracting} onClick={handleSendUnlockRequest}><FiSend /> {isRetracting ? "Đang gửi..." : "Gửi yêu cầu"}</button>
          </div>
        </div>
      </Modal>

      {/* Student Detail — moved to /teacher/grades/student/:enrollmentId */}
    </div>
  );
}
