import { useMemo, useState, useEffect } from "react";
import Modal from "../../../components/ui/Modal/Modal";
import { Select } from "../../../components/ui";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import teacherService from "../../../services/pages/teacher/teacherService";
import GradeListSection from "./components/gradeListSection/GradeListSection";
import { FiPlus, FiSave, FiX, FiTrash2, FiLock, FiUnlock, FiSend } from "react-icons/fi";
import GradeSummarySection, { GradeSummaryHeader } from "./components/gradeSummarySection/GradeSummarySection";
import { toast } from "react-toastify";
import "./TeacherGrades.css";

const SEMESTERS = {
  hk1: { label: "Học kỳ 1" },
  hk2: { label: "Học kỳ 2" },
};

function round1(value) {
  if (value === null || value === undefined || isNaN(value)) return 0;
  return Math.round(value * 10) / 10;
}

function getRank(average) {
  if (average >= 8.5) return "excellent";
  if (average >= 7.0) return "good";
  if (average >= 5.5) return "fair";
  if (average >= 4.0) return "average";
  return "weak";
}

function normalizeClassItem(item = {}) {
  return {
    ...item,
    id: item.id,
    name: item.name || item.class_name || item.className || "",
    teacher: item.teacher || item.teacher_name || item.homeroom_teacher_name || item.homeroomTeacher || "",
    subjects: item.subjects || [],
  };
}

function normalizeSubjectItem(item = {}) {
  return {
    ...item,
    id: item.class_teacher_subject_id ?? item.id ?? item.subject_id ?? item.subject_assignment_id,
    teacherId: item.teacher_id ?? item.teacherId ?? null,
    name: item.name || item.display_name || item.subject_name || "",
    code: item.code || item.subject_code || "",
  };
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function normalizeSchoolYearLabel(value) {
  return normalizeText(value).replace(/\s+/g, "");
}

function normalizeGradeCategory(categoryName = "", gradeItemName = "") {
  const text = normalizeText(`${categoryName} ${gradeItemName}`);

  if (text.includes("giua ky") || text.includes("midterm")) return "midterm";
  if (text.includes("cuoi ky") || text.includes("final")) return "final";
  return "regular";
}

function toScoreNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function buildStudentGradeRecords(students = [], gradeRows = []) {
  const groupedRows = new Map();

  for (const row of gradeRows) {
    const enrollmentId = String(row.student_enrollment_id ?? row.enrollment_id ?? row.studentEnrollmentId ?? "");
    if (!enrollmentId) continue;

    const existing = groupedRows.get(enrollmentId) || [];
    existing.push({
      id: row.id,
      gradeItemId: row.grade_item_id ?? null,
      gradeItemName: row.grade_item_name || row.name || "",
      categoryName: row.category_name || "",
      categoryKey: normalizeGradeCategory(row.category_name, row.grade_item_name || row.name || ""),
      score: toScoreNumber(row.score),
      note: row.note || "",
      enteredAt: row.entered_at || row.created_at || null,
      maxScore: toScoreNumber(row.max_score),
    });
    groupedRows.set(enrollmentId, existing);
  }

  return students.map((student = {}) => {
    const enrollmentId = String(student.enrollment_id ?? student.id ?? "");
    const rows = groupedRows.get(enrollmentId) || [];

    const regularScores = rows
      .filter((item) => item.categoryKey === "regular")
      .sort((a, b) => String(a.enteredAt || "").localeCompare(String(b.enteredAt || "")))
      .map((item, index) => ({
        id: item.id,
        label: item.gradeItemName || `Thường xuyên ${index + 1}`,
        score: item.score,
        note: item.note,
        gradeItemId: item.gradeItemId,
      }));

    const midtermRow = rows.find((item) => item.categoryKey === "midterm") || null;
    const finalRow = rows.find((item) => item.categoryKey === "final") || null;

    const regularScoresNumbers = regularScores.map((item) => item.score).filter((value) => value !== null);
    const midtermScore = midtermRow?.score ?? null;
    const finalScore = finalRow?.score ?? null;

    const weightedSum = regularScoresNumbers.reduce((sum, value) => sum + value, 0)
      + (midtermScore !== null ? midtermScore * 2 : 0)
      + (finalScore !== null ? finalScore * 3 : 0);
    const denominator = regularScoresNumbers.length
      + (midtermScore !== null ? 2 : 0)
      + (finalScore !== null ? 3 : 0);
    const average = denominator ? round1(weightedSum / denominator) : 0;
    const isProvisional = regularScoresNumbers.length < 2 || midtermScore === null || finalScore === null;

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
      note: rows.map((item) => item.note).find(Boolean) || "",
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

export default function TeacherGrades() {
  const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
  const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
  const teacherId = storedUser?.profile?.id || storedUser?.id || null;
  
  // State
  const [grades] = useState(["10", "11", "12"]);
  const [selectedGrade, setSelectedGrade] = useState("10");
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [classSubjects, setClassSubjects] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [classStudents, setClassStudents] = useState([]);
  const [gradeRows, setGradeRows] = useState([]);
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Dialog State
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [atRiskDialogOpen, setAtRiskDialogOpen] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);
  const [editDraft, setEditDraft] = useState({
    regularScores: [""],
    midterm: "",
    final: "",
    note: ""
  });
  
  // Grade Lock/Unlock State
  const [lockStatus, setLockStatus] = useState("draft");
  const [unlockRequestOpen, setUnlockRequestOpen] = useState(false);
  const [unlockReason, setUnlockReason] = useState("");

  const selectedSemester = useMemo(() => {
    const orderedSemesters = [...semesters].sort((a, b) => String(a.start_date || a.startDate || "").localeCompare(String(b.start_date || b.startDate || "")));
    if (!orderedSemesters.length) return null;
    if (selectedTerm === "hk2") return orderedSemesters[1] || orderedSemesters[0] || null;
    return orderedSemesters[0] || null;
  }, [semesters, selectedTerm]);

  const editableSubjectIds = useMemo(() => {
    return new Set(
      classSubjects
        .filter((subject) => String(subject.teacherId ?? "") === String(teacherId))
        .map((subject) => String(subject.id)),
    );
  }, [classSubjects, teacherId]);

  const selectedSubjectEditable = useMemo(() => {
    return editableSubjectIds.has(String(selectedSubjectId));
  }, [editableSubjectIds, selectedSubjectId]);

  // Fetch Classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        if (!teacherId) return;
        const response = await teacherService.getConsolidatedTeachingClasses({
          params: {
            schoolYear: selectedSchoolYear,
            term: selectedTerm,
          },
          mock: false,
        });
        if (response.success) {
          const fetchedClasses = dedupeById((response.data || []).map(normalizeClassItem));
          setClasses(fetchedClasses);
          if (fetchedClasses.length > 0 && !selectedClassId) {
            setSelectedClassId(fetchedClasses[0].id);
          }
        }
      } catch (err) {
        console.error("Fetch classes error:", err);
      }
    };
    fetchClasses();
  }, [teacherId, selectedSchoolYear, selectedTerm]);

  useEffect(() => {
    const fetchAcademicCalendar = async () => {
      try {
        const [schoolYearsResponse, currentSchoolYearResponse] = await Promise.all([
          teacherService.listSchoolYears({ mock: false }),
          teacherService.getCurrentSchoolYear({ mock: false }),
        ]);

        const fetchedSchoolYears = schoolYearsResponse.success ? (schoolYearsResponse.data || []) : [];
        const currentSchoolYear = currentSchoolYearResponse.success ? currentSchoolYearResponse.data : null;
        setSchoolYears(fetchedSchoolYears);

        const selectedYear = fetchedSchoolYears.find((item) => normalizeSchoolYearLabel(item.name) === normalizeSchoolYearLabel(selectedSchoolYear))
          || currentSchoolYear
          || fetchedSchoolYears[0]
          || null;

        if (!selectedYear?.id) {
          setSemesters([]);
          return;
        }

        const semestersResponse = await teacherService.listSemesters({
          params: { schoolYearId: selectedYear.id },
          mock: false,
        });

        setSemesters(semestersResponse.success ? (semestersResponse.data || []) : []);
      } catch (err) {
        console.error("Fetch academic calendar error:", err);
        setSchoolYears([]);
        setSemesters([]);
      }
    };

    fetchAcademicCalendar();
  }, [selectedSchoolYear]);

  // Derive subjects from the selected teaching class (class_teacher_subject rows)
  useEffect(() => {
    const fetchClassSubjects = async () => {
      if (!selectedClassId) {
        setClassSubjects([]);
        setSubjects([]);
        setSelectedSubjectId("");
        return;
      }

      try {
        const response = await teacherService.getClassSubjects({
          pathParams: { id: selectedClassId },
          mock: false,
        });
        const nextSubjects = dedupeById((response.success ? (response.data || []) : []).map(normalizeSubjectItem));
        setClassSubjects(nextSubjects);
        setSubjects(nextSubjects);

        if (nextSubjects.length > 0) {
          const selectedStillValid = nextSubjects.some((subject) => String(subject.id) === String(selectedSubjectId));
          if (!selectedStillValid) {
            setSelectedSubjectId(nextSubjects[0].id);
          }
        } else {
          setSelectedSubjectId("");
        }
      } catch (err) {
        console.error("Fetch class subjects error:", err);
        setClassSubjects([]);
        setSubjects([]);
        setSelectedSubjectId("");
      }
    };

    fetchClassSubjects();
  }, [selectedClassId, selectedSubjectId]);

  // Fetch students + raw grade rows + grade items for the selected class/subject
  useEffect(() => {
    const fetchClassGrades = async () => {
      if (!selectedClassId || !selectedSubjectId) {
        setRecords([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [studentsResponse, gradeItemsResponse, gradesResponse] = await Promise.all([
          teacherService.getClassStudents({
            pathParams: { id: selectedClassId },
            mock: false,
          }),
          teacherService.listGradeItems({
            params: {
              classTeacherSubjectId: selectedSubjectId,
              semesterId: selectedSemester?.id,
            },
            mock: false,
          }),
          teacherService.getGradesByClass({
            pathParams: { classId: selectedClassId },
            params: selectedSemester?.id ? { semesterId: selectedSemester.id } : undefined,
            mock: false,
          }),
        ]);

        const students = studentsResponse.success ? (studentsResponse.data || []) : [];
        const gradeItems = gradeItemsResponse?.success ? (gradeItemsResponse.data || []) : [];
        const gradeItemIds = new Set(gradeItems.map((item) => String(item.id)));
        const rawGrades = gradesResponse?.success ? (gradesResponse.data || []) : [];
        const filteredGrades = rawGrades.filter((row) => gradeItemIds.has(String(row.grade_item_id)));

        setClassStudents(students);
        setGradeRows(filteredGrades);
        setRecords(buildStudentGradeRecords(students, filteredGrades));
      } catch (err) {
        console.error("Fetch class grades error:", err);
        setError("Đã xảy ra lỗi khi tải dữ liệu điểm số.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassGrades();
  }, [selectedClassId, selectedSubjectId, selectedSchoolYear, selectedTerm, selectedSemester?.id]);

  // Filtered Classes based on Grade
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const className = String(c?.name || c?.class_name || c?.className || "");
      return className.startsWith(selectedGrade);
    });
  }, [classes, selectedGrade]);

  // Update selected class if it's no longer in filtered list
  useEffect(() => {
    if (filteredClasses.length > 0) {
      if (!selectedClassId || !filteredClasses.find(c => String(c.id) === String(selectedClassId))) {
        setSelectedClassId(filteredClasses[0].id);
      }
    } else {
      setSelectedClassId("");
    }
  }, [filteredClasses]);

  useEffect(() => {
    fetchGrades();
    fetchLockStatus();
  }, [selectedClassId, selectedSubjectId, selectedSchoolYear, selectedTerm]);
  // Derived Summary Stats
  const summaryStats = useMemo(() => {
    if (!records.length) return {
      average: 0, passRate: 0, excellentRate: 0, atRiskCount: 0, atRiskStudents: []
    };

    const averages = records.map(r => r.average).filter(v => v !== null);
    const totalAvg = averages.length ? averages.reduce((a, b) => a + b, 0) / averages.length : 0;
    const passCount = records.filter(r => r.average >= 5).length;
    const excellentCount = records.filter(r => r.average >= 8.5).length;
    const atRiskStudents = records.filter(r => r.average < 5);

    return {
      average: round1(totalAvg),
      passRate: Math.round((passCount / records.length) * 100),
      excellentRate: Math.round((excellentCount / records.length) * 100),
      atRiskCount: atRiskStudents.length,
      atRiskStudents
    };
  }, [records]);

  const fetchLockStatus = async () => {
    if (!selectedClassId || !selectedSubjectId) return;
    try {
      const response = await teacherService.getGradesLockStatus({
        params: {
          classId: selectedClassId,
          subjectId: selectedSubjectId,
          schoolYear: selectedSchoolYear,
          term: selectedTerm
        },
        mock: false
      });
      if (response.success && response.data) {
        setLockStatus(response.data.status || "draft");
      } else {
        setLockStatus("draft");
      }
    } catch (err) {
      console.error("Fetch lock status error:", err);
      setLockStatus("draft");
    }
  };

  // Handlers
  const handleClassChange = (e) => setSelectedClassId(e.target.value);
  const fetchGrades = async () => {
    if (!selectedClassId || !selectedSubjectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [studentsResponse, gradeItemsResponse, gradesResponse] = await Promise.all([
        teacherService.getClassStudents({
          pathParams: { id: selectedClassId },
          mock: false,
        }),
        teacherService.listGradeItems({
          params: {
            classTeacherSubjectId: selectedSubjectId,
            semesterId: selectedSemester?.id,
          },
          mock: false,
        }),
        teacherService.getGradesByClass({
          pathParams: { classId: selectedClassId },
          params: selectedSemester?.id ? { semesterId: selectedSemester.id } : undefined,
          mock: false,
        }),
      ]);

      const students = studentsResponse.success ? (studentsResponse.data || []) : [];
      const gradeItems = gradeItemsResponse?.success ? (gradeItemsResponse.data || []) : [];
      const gradeItemIds = new Set(gradeItems.map((item) => String(item.id)));
      const rawGrades = gradesResponse?.success ? (gradesResponse.data || []) : [];
      const filteredGrades = rawGrades.filter((row) => gradeItemIds.has(String(row.grade_item_id)));
      setClassStudents(students);
      setGradeRows(filteredGrades);
      setRecords(buildStudentGradeRecords(students, filteredGrades));
    } catch (err) {
      console.error("Fetch grades error:", err);
      setError("Đã xảy ra lỗi khi tải dữ liệu điểm số.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const openEditDialog = (record) => {
    setEditStudentId(record.id);

    setEditDraft({
      regularScores: (record.regularScores || []).length 
        ? record.regularScores.map((item) => ({ score: String(item.score ?? ""), gradeItemId: item.gradeItemId })) 
        : [{ score: "", gradeItemId: null }],
      midterm: { score: String(record.midtermScore ?? ""), gradeItemId: record.midtermGradeItemId || null },
      final: { score: String(record.finalScore ?? ""), gradeItemId: record.finalGradeItemId || null },
      note: record.note || ""
    });
    setEditDialogOpen(true);
  };

  const handleSaveGrade = async () => {
    try {
      const payload = {
         classTeacherSubjectId: selectedSubjectId,
         semesterId: selectedSemester?.id,
         studentEnrollmentId: editStudentId,
         regularScores: editDraft.regularScores.map(v => ({ score: v.score, gradeItemId: v.gradeItemId })),
         midterm: { score: editDraft.midterm.score, gradeItemId: editDraft.midterm.gradeItemId },
         final: { score: editDraft.final.score, gradeItemId: editDraft.final.gradeItemId },
         note: editDraft.note
      };

      const res = await teacherService.teacherUpsertGrades({ body: payload, mock: false });
      if (res && res.success) {
        toast.success("Đã cập nhật điểm thành công!");
        setEditDialogOpen(false);
        fetchGrades();
      } else {
        toast.error("Lỗi khi lưu điểm: " + (res?.error || ""));
      }
    } catch (err) {
      console.error("Save grade error:", err);
      toast.error("Lỗi khi lưu điểm.");
    }
  };

  const handleLockGrades = async () => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn khóa điểm môn học này? Sau khi khóa, bạn sẽ không thể chỉnh sửa điểm nếu không có sự phê duyệt từ Ban giám hiệu.");
    if (!confirmed) return;

    try {
      const response = await teacherService.finalizeClassGrades({
        body: {
          classId: selectedClassId,
          subjectId: selectedSubjectId,
          schoolYear: selectedSchoolYear,
          term: selectedTerm,
          status: "locked"
        },
        mock: true
      });

      if (response.success) {
        setLockStatus("locked");
        toast.success("Đã khóa điểm môn học thành công!");
      } else {
        toast.error("Không thể khóa điểm.");
      }
    } catch (err) {
      console.error("Lock grades error:", err);
      toast.error("Đã xảy ra lỗi khi khóa điểm.");
    }
  };

  const handleSendUnlockRequest = () => {
    if (!unlockReason.trim()) {
      toast.warning("Vui lòng nhập lý do yêu cầu mở khóa.");
      return;
    }

    toast.success("Yêu cầu mở khóa đã được gửi thành công đến Ban giám hiệu!");
    setUnlockRequestOpen(false);
  };

  const calculateRecordAverage = (draft) => {
    const regular = (draft.regularScores || []).filter(v => v.score !== "").map(v => Number(v.score)).filter((v) => Number.isFinite(v));
    const midterm = draft.midterm.score !== "" ? Number(draft.midterm.score) : null;
    const final = draft.final.score !== "" ? Number(draft.final.score) : null;

    const weightedSum = regular.reduce((a, b) => a + b, 0)
      + (midterm !== null && Number.isFinite(midterm) ? midterm * 2 : 0)
      + (final !== null && Number.isFinite(final) ? final * 3 : 0);
    const denominator = regular.length
      + (midterm !== null && Number.isFinite(midterm) ? 2 : 0)
      + (final !== null && Number.isFinite(final) ? 3 : 0);

    if (denominator === 0) return 0;
    return round1(weightedSum / denominator);
  };

  const currentClass = classes.find(c => c.id === selectedClassId) || {};
  const currentSubject = subjects.find(s => String(s.id) === String(selectedSubjectId)) || {};
  const semesterLabel = SEMESTERS[selectedTerm]?.label || selectedTerm;
  const classOptions = useMemo(
    () => dedupeById(filteredClasses).map((c) => ({ value: c.id, label: c.name || `Lớp ${c.id}` })),
    [filteredClasses]
  );

  if (error) {
    return (
      <div className="teacher-grades-error">
        <p>{error}</p>
        <button onClick={fetchGrades}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className="teacher-grades-page">
      <PageHeader
        title="Quản lý điểm học sinh"
        eyebrow={`Lớp: ${currentClass.name || "---"} | Môn: ${currentSubject.name || "---"}`}
        actions={
          <SchoolYearTermSelector
            selectedSchoolYear={selectedSchoolYear}
            selectedTerm={selectedTerm}
            onYearChange={handleYearArrow}
            onTermChange={handleTermChange}
          />
        }
      />

      <div className="teacher-grades-top-panel">
        <div className="teacher-grades-toolbar">
          <div className="teacher-grades-toolbar__group">
            <Select
              className="teacher-grades-select"
              variant="custom"
              label="Khối"
              value={selectedGrade}
              options={grades.map(g => ({ value: g, label: `Khối ${g}` }))}
              onChange={(e) => setSelectedGrade(e.target.value)}
            />
            <Select
              className="teacher-grades-select"
              variant="custom"
              label="Chọn lớp"
              value={selectedClassId}
              options={classOptions}
              onChange={handleClassChange}
              searchable
            />
            <Select
              className="teacher-grades-select"
              variant="custom"
              label="Môn học"
              value={selectedSubjectId}
              options={subjects.map((subject) => ({
                value: subject.id,
                label: subject.name,
              }))}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              searchable
            />
          </div>

          <div className="teacher-grades-toolbar__meta" style={{ gap: "12px", display: "flex", alignItems: "center" }}>
            <span className={`grade-lock-status-badge ${lockStatus === 'locked' ? 'is-locked' : 'is-draft'}`}>
              {lockStatus === 'locked' ? (
                <>
                  <FiLock style={{ marginRight: '6px' }} /> Đã khóa
                </>
              ) : (
                <>
                  <FiUnlock style={{ marginRight: '6px' }} /> Bản nháp
                </>
              )}
            </span>

            {lockStatus === 'locked' ? (
              <button 
                className="teacher-grades-action-btn is-unlock-request"
                onClick={() => {
                  setUnlockReason("");
                  setUnlockRequestOpen(true);
                }}
              >
                <FiSend style={{ marginRight: '6px' }} /> Yêu cầu mở khóa
              </button>
            ) : (
              <button 
                className="teacher-grades-action-btn is-lock"
                onClick={handleLockGrades}
              >
                <FiLock style={{ marginRight: '6px' }} /> Khóa điểm
              </button>
            )}

            <span className="grade-entry-badge teacher-grades-teacher-badge">
              GVCN: {currentClass.teacher || "Chưa phân công"}
            </span>
          </div>
        </div>

        <div className="teacher-grades-summary-header">
          <GradeSummaryHeader subjectLabel={currentSubject.name} />
        </div>

        <div className="teacher-grades-summary-row">
          <GradeSummarySection
            stats={summaryStats}
            onOpenAtRisk={() => setAtRiskDialogOpen(true)}
          />
        </div>
      </div>

      <div className="teacher-grades-notice">
        Dữ liệu lấy trực tiếp từ API gradebook ({records.length} học sinh, {gradeRows.length} dòng điểm) và được gom theo từng học sinh.
      </div>

      {isLoading ? (
        <div className="teacher-grades-loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu điểm số...</p>
        </div>
      ) : (
        <div className="teacher-grades-grid">
          <GradeListSection
            records={records}
            onOpenEditDialog={openEditDialog}
            subjectLabel={currentSubject.name}
            semesterLabel={semesterLabel}
            isLocked={lockStatus === 'locked'}
            canEdit={selectedSubjectEditable}
          />
        </div>
      )}

      {/* Edit Grade Modal */}
      <Modal
        open={editDialogOpen}
        title={editStudentId ? `Chỉnh sửa điểm - ${records.find(r => r.id === editStudentId)?.name}` : "Chỉnh sửa điểm"}
        onClose={() => setEditDialogOpen(false)}
        className="teacher-grade-edit-modal"
      >
        <div className="teacher-grade-edit-form">
           <div className="teacher-grade-edit-meta">
              <span>{currentClass.name}</span>
              <span>{currentSubject.name}</span>
              <span>{semesterLabel}</span>
           </div>

           <section className="grade-entry-score-block">
              <div className="grade-entry-score-block__head">
                <span>Điểm thường xuyên</span>
                <button 
                  className="grade-entry-score-add-btn"
                  onClick={() => {
                    setEditDraft(prev => ({
                      ...prev,
                      regularScores: [...prev.regularScores, { score: "", gradeItemId: null }]
                    }));
                  }}
                >
                  <FiPlus />
                </button>
              </div>
              <div className="grade-entry-score-grid">
                {editDraft.regularScores.map((val, idx) => (
                  <div key={`regular-${idx}`} className="grade-entry-field">
                    <div className="grade-entry-field__label">
                      <span>TX {idx + 1}</span>
                      {editDraft.regularScores.length > 1 && (
                        <button 
                          className="grade-entry-delete-btn"
                          onClick={() => {
                            setEditDraft(prev => ({
                              ...prev,
                              regularScores: prev.regularScores.filter((_, i) => i !== idx)
                            }));
                          }}
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                    <input 
                      type="number" step="0.1" min="0" max="10" value={val.score} 
                      onChange={e => {
                        const next = [...editDraft.regularScores];
                        next[idx].score = e.target.value;
                        setEditDraft(prev => ({ ...prev, regularScores: next }));
                      }}
                    />
                  </div>
                ))}
              </div>
           </section>

           <div className="teacher-grade-edit-grid">
             <div className="teacher-grade-edit-note">
               <span>Giữa kỳ</span>
               <input 
                 type="number" step="0.1" min="0" max="10" value={editDraft.midterm.score} 
                 onChange={e => setEditDraft(prev => ({ ...prev, midterm: { ...prev.midterm, score: e.target.value } }))}
               />
             </div>
             <div className="teacher-grade-edit-note">
               <span>Cuối kỳ</span>
               <input 
                 type="number" step="0.1" min="0" max="10" value={editDraft.final.score} 
                 onChange={e => setEditDraft(prev => ({ ...prev, final: { ...prev.final, score: e.target.value } }))}
               />
             </div>
           </div>

           <div className="teacher-grade-edit-note">
              <span>Ghi chú</span>
              <textarea 
                rows="3" value={editDraft.note} 
                onChange={e => setEditDraft(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Nhận xét của giáo viên..."
              />
           </div>

           <div className="teacher-grade-edit-actions">
              <button className="teacher-grade-edit-btn is-ghost" onClick={() => setEditDialogOpen(false)}>
                <FiX /> Hủy
              </button>
              <button className="teacher-grade-edit-btn is-primary" onClick={handleSaveGrade}>
                <FiSave /> Lưu thay đổi
              </button>
           </div>
        </div>
      </Modal>

      {/* At Risk List Modal */}
      <Modal
        open={atRiskDialogOpen}
        title={`Học sinh cảnh báo (${summaryStats.atRiskCount})`}
        onClose={() => setAtRiskDialogOpen(false)}
        className="teacher-grade-risk-modal"
      >
        <div className="teacher-grade-risk-list">
          {summaryStats.atRiskStudents.map(student => (
            <div 
              key={student.id} 
              className={`teacher-grade-risk-item ${lockStatus === 'locked' ? 'is-locked-cursor' : ''}`}
              onClick={() => { 
                if (lockStatus === 'locked') {
                  toast.warning("Điểm số đã khóa, không thể chỉnh sửa!");
                  return;
                }
                setAtRiskDialogOpen(false); 
                openEditDialog(student); 
              }}
            >
              <div>
                <strong>{student.name}</strong>
                <span>{student.code}</span>
              </div>
              <small>TB: {student.average}</small>
            </div>
          ))}
          {summaryStats.atRiskCount === 0 && <p style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>Không có học sinh nào bị cảnh báo.</p>}
        </div>
      </Modal>

      {/* Request Unlock Modal */}
      <Modal
        open={unlockRequestOpen}
        title="Yêu cầu mở khóa chỉnh sửa điểm"
        onClose={() => setUnlockRequestOpen(false)}
        className="teacher-grade-unlock-request-modal"
      >
        <div className="teacher-grade-edit-form">
          <div className="teacher-grade-edit-meta">
            <span>{currentClass.name}</span>
            <span>{currentSubject.name}</span>
            <span>{semesterLabel}</span>
          </div>
          <div className="teacher-grade-edit-note">
            <span>Lý do yêu cầu mở khóa</span>
            <textarea
              rows="4"
              value={unlockReason}
              onChange={(e) => setUnlockReason(e.target.value)}
              placeholder="Nhập lý do chi tiết để Ban giám hiệu xem xét duyệt mở khóa chỉnh sửa..."
            />
          </div>
          <div className="teacher-grade-edit-actions">
            <button className="teacher-grade-edit-btn is-ghost" onClick={() => setUnlockRequestOpen(false)}>
              <FiX /> Hủy
            </button>
            <button className="teacher-grade-edit-btn is-primary" onClick={handleSendUnlockRequest}>
              <FiSend /> Gửi yêu cầu
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Mock Data Generator for Development
function generateMockRecords(classId, subjectId, term) {
  const names = [
    "Nguyễn Minh Kiet", "Trần Gia Hân", "Lê Hoàng Nam", "Phạm Thu Uyên", "Võ Anh Khoa",
    "Đặng Gia Minh", "Phan Ngọc Hân", "Bùi Anh Thư", "Lý Thành Công", "Trương Khánh An"
  ];
  
  return names.map((name, i) => {
    const oral = [round1(8 + Math.random() * 2), round1(7 + Math.random() * 3)];
    const test15 = [round1(7 + Math.random() * 3)];
    const midterm = round1(6 + Math.random() * 4);
    const final = round1(5 + Math.random() * 5);
    
    // Weighted average: (oral + 15p + midterm*2 + final*3) / (n_oral + n_15p + 2 + 3)
    const avg = round1((oral.reduce((a, b) => a+b, 0) + test15.reduce((a, b) => a+b, 0) + midterm*2 + final*3) / (oral.length + test15.length + 5));
    
    return {
      id: i + 1,
      name,
      code: `${classId}-${(i+1).toString().padStart(2, '0')}`,
      oralScores: oral.map(String),
      test15Scores: test15.map(String),
      midterm: String(midterm),
      final: String(final),
      average: avg,
      rank: getRank(avg),
      status: avg >= 5 ? "Đạt" : "Chưa đạt",
      note: ""
    };
  });
}
