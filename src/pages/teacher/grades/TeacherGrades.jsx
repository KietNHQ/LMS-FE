import { useMemo, useState } from "react";
import Modal from "../../../components/ui/Modal/Modal";
import { Select } from "../../../components/ui";
import { PageHeader, SchoolYearTermSelector } from "../../../components/common";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import GradeListSection from "./components/gradeListSection/GradeListSection";
import GradeEntrySection from "./components/gradeEntrySection/GradeEntrySection";
import GradeSummarySection, { GradeSummaryHeader } from "./components/gradeSummarySection/GradeSummarySection";
import "./TeacherGrades.css";

const SEMESTERS = {
    hk1: { label: "Học kỳ 1" },
    hk2: { label: "Học kỳ 2" },
};

const SCORE_OFFSETS = [1.2, 0.6, 0, -0.8, -1.6, -2.4, -3.2, -4.0, -4.8, -5.6];

const TOAN = "Toán";
const NGU_VAN = "Ngữ văn";
const TIENG_ANH = "Tiếng Anh";
const VAT_LY = "Vật lý";
const TIN_HOC = "Tin học";
const HOA_HOC = "Hóa học";

const CLASS_CONFIGS = {
    "10A1": {
        label: "Lớp 10A1",
        teacher: "Cô Trần Minh Anh",
        subjects: ["Toán", "Ngữ văn", "Tiếng Anh"],
        students: [
            { id: 1, name: "Nguyễn Minh Kiet", code: "10A1-01" },
            { id: 2, name: "Trần Gia Hân", code: "10A1-02" },
            { id: 3, name: "Lê Hoàng Nam", code: "10A1-03" },
            { id: 4, name: "Phạm Thu Uyên", code: "10A1-04" },
            { id: 5, name: "Võ Anh Khoa", code: "10A1-05" },
            { id: 6, name: "Đặng Gia Minh", code: "10A1-06" },
            { id: 7, name: "Phan Ngọc Hân", code: "10A1-07" },
            { id: 8, name: "Bùi Anh Thư", code: "10A1-08" },
            { id: 9, name: "Lý Thành Công", code: "10A1-09" },
            { id: 10, name: "Trương Khánh An", code: "10A1-10" },
        ],
        subjectBases: {
            [TOAN]: {
                hk1: { oral: 8.6, test15: 8.8, midterm: 8.4, final: 8.9 },
                hk2: { oral: 8.8, test15: 9.0, midterm: 8.7, final: 9.1 },
            },
            [NGU_VAN]: {
                hk1: { oral: 7.8, test15: 8.0, midterm: 7.6, final: 7.9 },
                hk2: { oral: 7.9, test15: 8.1, midterm: 7.8, final: 8.2 },
            },
            [TIENG_ANH]: {
                hk1: { oral: 8.2, test15: 8.4, midterm: 8.0, final: 8.5 },
                hk2: { oral: 8.4, test15: 8.5, midterm: 8.3, final: 8.7 },
            },
        },
    },
    "11A1": {
        label: "Lớp 11A1",
        teacher: "Thầy Nguyễn Quốc Bảo",
        subjects: ["Toán", "Vật lý", "Tin học"],
        students: [
            { id: 1, name: "Đỗ Minh Tú", code: "11A1-01" },
            { id: 2, name: "Ngô Thanh Tâm", code: "11A1-02" },
            { id: 3, name: "Bùi Gia Bảo", code: "11A1-03" },
            { id: 4, name: "Phan Nhật Huy", code: "11A1-04" },
            { id: 5, name: "Huỳnh Khánh Vy", code: "11A1-05" },
            { id: 6, name: "Vũ Hải Đăng", code: "11A1-06" },
            { id: 7, name: "Lâm Trí Dũng", code: "11A1-07" },
            { id: 8, name: "Nguyễn Tuệ Nhi", code: "11A1-08" },
            { id: 9, name: "Trần Đình Phúc", code: "11A1-09" },
            { id: 10, name: "Cao Mỹ Linh", code: "11A1-10" },
        ],
        subjectBases: {
            [TOAN]: {
                hk1: { oral: 8.0, test15: 8.2, midterm: 7.9, final: 8.3 },
                hk2: { oral: 8.3, test15: 8.5, midterm: 8.1, final: 8.6 },
            },
            [VAT_LY]: {
                hk1: { oral: 7.6, test15: 7.8, midterm: 7.4, final: 7.9 },
                hk2: { oral: 7.9, test15: 8.0, midterm: 7.7, final: 8.1 },
            },
            [TIN_HOC]: {
                hk1: { oral: 8.4, test15: 8.5, midterm: 8.2, final: 8.6 },
                hk2: { oral: 8.6, test15: 8.7, midterm: 8.4, final: 8.8 },
            },
        },
    },
    "12A1": {
        label: "Lớp 12A1",
        teacher: "Cô Lê Thanh Hà",
        subjects: ["Toán", "Hóa học", "Tiếng Anh"],
        students: [
            { id: 1, name: "Mai Gia Huy", code: "12A1-01" },
            { id: 2, name: "Lý Ngọc Trân", code: "12A1-02" },
            { id: 3, name: "Trương Nhật Minh", code: "12A1-03" },
            { id: 4, name: "Đặng Nguyên Khang", code: "12A1-04" },
            { id: 5, name: "Cao Thiên An", code: "12A1-05" },
            { id: 6, name: "Nguyễn Hoàng Phúc", code: "12A1-06" },
            { id: 7, name: "Phạm Bảo Ngọc", code: "12A1-07" },
            { id: 8, name: "Võ Đức Long", code: "12A1-08" },
            { id: 9, name: "Hoàng Yến Nhi", code: "12A1-09" },
            { id: 10, name: "Lê Minh Quân", code: "12A1-10" },
        ],
        subjectBases: {
            [TOAN]: {
                hk1: { oral: 8.8, test15: 9.0, midterm: 8.7, final: 9.1 },
                hk2: { oral: 9.0, test15: 9.1, midterm: 8.9, final: 9.3 },
            },
            [HOA_HOC]: {
                hk1: { oral: 8.2, test15: 8.3, midterm: 8.0, final: 8.4 },
                hk2: { oral: 8.4, test15: 8.6, midterm: 8.2, final: 8.7 },
            },
            [TIENG_ANH]: {
                hk1: { oral: 8.5, test15: 8.6, midterm: 8.3, final: 8.7 },
                hk2: { oral: 8.7, test15: 8.8, midterm: 8.5, final: 8.9 },
            },
        },
    },
};

const DEFAULT_CLASS_ID = Object.keys(CLASS_CONFIGS)[0];
const DEFAULT_CLASS_CONFIG = CLASS_CONFIGS[DEFAULT_CLASS_ID];

function round1(value) {
    return Math.round(value * 10) / 10;
}

function formatScoreValue(value) {
    return value === "" || value === null || value === undefined ? "" : String(round1(Number(value)));
}

function createDraftFromScores(scores) {
    const oralScores = scores?.oralScores?.length ? scores.oralScores : [scores?.oral ?? ""];
    const test15Scores = scores?.test15Scores?.length ? scores.test15Scores : [scores?.test15 ?? ""];
    const oneTietScores = scores?.oneTietScores?.length ? scores.oneTietScores : [scores?.oneTiet ?? ""];
    const midterm = scores?.midterm ?? oneTietScores?.[0] ?? "";

    return {
        oralScores: oralScores.map(formatScoreValue),
        test15Scores: test15Scores.map(formatScoreValue),
        oneTietScores: oneTietScores.map(formatScoreValue),
        midterm: formatScoreValue(midterm),
        oneTiet: formatScoreValue(oneTietScores[0]),
        final: formatScoreValue(scores?.final),
        note: scores?.note || "",
    };
}

function parseDraftScores(values, fallbackValues = []) {
    const sourceValues = values?.length ? values : fallbackValues.map((value) => String(value));

    const parsedScores = sourceValues
        .map((value, index) => {
            if (value === "" || value === null || value === undefined) {
                // Keep old values only for already-existing columns; ignore newly-added empty columns.
                if (index < fallbackValues.length && sourceValues.length <= fallbackValues.length) {
                    return clampScore(Number(fallbackValues[index]));
                }
                return null;
            }

            const parsed = Number(value);
            return Number.isFinite(parsed) ? clampScore(parsed) : null;
        })
        .filter((value) => value !== null);

    return parsedScores.length ? parsedScores : [clampScore(Number(fallbackValues[0] ?? 0))];
}

function getDisplayScoreFromList(values = []) {
    const numericValues = values.filter((value) => typeof value === "number" && !Number.isNaN(value));
    if (!numericValues.length) return 0;
    if (numericValues.length === 1) return round1(numericValues[0]);
    return round1(numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length);
}

function clampScore(value) {
    return Math.min(10, Math.max(0, round1(value)));
}

function calculateAverage(scores) {
    const oneTietValues = scores.oneTietScores?.length ? scores.oneTietScores : scores.oneTiet !== undefined ? [scores.oneTiet] : [];
    const midtermValue = typeof scores.midterm === "number" && !Number.isNaN(scores.midterm) ? [scores.midterm] : [];

    const components = [
        ...(scores.oralScores || []),
        ...(scores.test15Scores || []),
        ...midtermValue,
        ...oneTietValues,
        scores.final,
    ].filter((value) => typeof value === "number" && !Number.isNaN(value));

    if (!components.length) return 0;
    return round1(components.reduce((sum, value) => sum + value, 0) / components.length);
}

function getRank(average) {
    if (average >= 8.5) return "excellent";
    if (average >= 7.0) return "good";
    if (average >= 5.5) return "fair";
    if (average >= 4.0) return "average";
    return "weak";
}

function getDraftFromRecord(record) {
    if (!record) {
        return { oralScores: [""], test15Scores: [""], oneTietScores: [""], midterm: "", oneTiet: "", final: "", note: "" };
    }

    return createDraftFromScores(record);
}

function buildScoresFromDraft(draft, fallbackRecord) {
    const fallback = createDraftFromScores(fallbackRecord);

    return {
        oralScores: parseDraftScores(draft.oralScores || [], fallback.oralScores),
        test15Scores: parseDraftScores(draft.test15Scores || [], fallback.test15Scores),
        midterm: clampScore(Number(draft.midterm === "" ? fallback.midterm : draft.midterm)),
        oneTietScores: parseDraftScores(draft.oneTietScores || (draft.oneTiet !== undefined ? [draft.oneTiet] : []), fallback.oneTietScores || [fallback.oneTiet]),
        final: clampScore(Number(draft.final === "" ? fallback.final : draft.final)),
        note: String(draft.note || "").trim(),
    };
}

function buildScore(baseScores, offset) {
    return {
        oralScores: [clampScore(baseScores.oral + offset)],
        test15Scores: [clampScore(baseScores.test15 + offset)],
        midterm: clampScore(baseScores.midterm + offset),
        oneTietScores: [clampScore(baseScores.midterm + offset - 0.2)],
        final: clampScore(baseScores.final + offset),
    };
}

function buildRecords(classConfig, subject, semester, overrides = {}) {
    const baseScores = classConfig.subjectBases[subject]?.[semester];

    if (!baseScores) {
        return [];
    }

    return classConfig.students.map((student, index) => {
        const recordKey = `${classConfig.label}-${subject}-${semester}-${student.id}`;
        const override = overrides[recordKey];
        const rawScores = override || buildScore(baseScores, SCORE_OFFSETS[index % SCORE_OFFSETS.length]);
        const scores = rawScores.oralScores ? rawScores : createDraftFromScores(rawScores);
        const oral = getDisplayScoreFromList(scores.oralScores);
        const test15 = getDisplayScoreFromList(scores.test15Scores);
        const oneTiet = getDisplayScoreFromList(scores.oneTietScores);
        const average = calculateAverage(scores);
        const rank = getRank(average);

        return {
            ...student,
            recordKey,
            subject,
            semester,
            ...scores,
            oral,
            test15,
            oneTiet,
            average,
            rank,
            status: average >= 5 ? "Đạt" : "Chưa đạt",
            note: override?.note || "",
        };
    });
}

export default function TeacherGrades() {
    const { selectedSchoolYear, selectedTerm, handleYearArrow, handleTermChange } = useSchoolYearTerm();
    const classOptions = Object.keys(CLASS_CONFIGS);
    const [selectedClassId, setSelectedClassId] = useState(DEFAULT_CLASS_ID);
    const [selectedStudentId, setSelectedStudentId] = useState(DEFAULT_CLASS_CONFIG.students[0].id);
    const [overrides, setOverrides] = useState({});
    const [draft, setDraft] = useState(
        getDraftFromRecord(buildScore(DEFAULT_CLASS_CONFIG.subjectBases[DEFAULT_CLASS_CONFIG.subjects[0]].hk1, 0))
    );
    const [saveMessage, setSaveMessage] = useState("");
    const [entryDialogOpen, setEntryDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [atRiskDialogOpen, setAtRiskDialogOpen] = useState(false);
    const [atRiskCandidates, setAtRiskCandidates] = useState([]);
    const [editStudentId, setEditStudentId] = useState(null);
    const [editDraft, setEditDraft] = useState(getDraftFromRecord(null));

    const currentClass = useMemo(() => CLASS_CONFIGS[selectedClassId], [selectedClassId]);
    const currentSubject = currentClass.subjects?.[0] || "Chưa phân môn";

    const currentRecords = useMemo(
        () => buildRecords(currentClass, currentSubject, selectedTerm, overrides),
        [currentClass, currentSubject, selectedTerm, overrides]
    );

    const activeStudentId = currentRecords.some((item) => item.id === selectedStudentId)
        ? selectedStudentId
        : currentRecords[0]?.id || null;

    const selectedRecord = useMemo(
        () => currentRecords.find((item) => item.id === activeStudentId) || null,
        [currentRecords, activeStudentId]
    );

    const editRecord = useMemo(
        () => currentRecords.find((item) => item.id === editStudentId) || null,
        [currentRecords, editStudentId]
    );

    const summaryStats = useMemo(() => {
        if (!currentRecords.length) {
            return {
                average: 0,
                passRate: 0,
                excellentRate: 0,
                atRiskCount: 0,
                atRiskStudents: [],
                topStudent: null,
                weakestStudent: null,
                rankDistribution: {
                    excellent: 0,
                    good: 0,
                    fair: 0,
                    average: 0,
                    weak: 0,
                },
            };
        }

        const totalAverage = currentRecords.reduce((sum, record) => sum + record.average, 0);
        const passCount = currentRecords.filter((record) => record.average >= 5).length;
        const excellentCount = currentRecords.filter((record) => record.average >= 8.5).length;
        const atRiskStudents = currentRecords.filter((record) => record.average < 5);
        const atRiskCount = atRiskStudents.length;
        const topStudent = currentRecords.reduce((best, record) => (record.average > best.average ? record : best), currentRecords[0]);
        const weakestStudent = currentRecords.reduce((worst, record) => (record.average < worst.average ? record : worst), currentRecords[0]);

        const rankDistribution = currentRecords.reduce(
            (acc, record) => {
                acc[record.rank] += 1;
                return acc;
            },
            {
                excellent: 0,
                good: 0,
                fair: 0,
                average: 0,
                weak: 0,
            }
        );

        return {
            average: round1(totalAverage / currentRecords.length),
            passRate: Math.round((passCount / currentRecords.length) * 100),
            excellentRate: Math.round((excellentCount / currentRecords.length) * 100),
            atRiskCount,
            atRiskStudents,
            topStudent,
            weakestStudent,
            rankDistribution,
        };
    }, [currentRecords]);

    const handleOpenSummaryStudent = (summaryCard) => {
        if (!summaryCard || !summaryCard.records?.length) return;

        if (summaryCard.key === "atRisk") {
            setAtRiskCandidates(summaryCard.records);
            setAtRiskDialogOpen(true);
            return;
        }

        openEditDialog(summaryCard.records[0]);
    };

    const semesterLabel = SEMESTERS[selectedTerm]?.label || selectedTerm;

    const handleClassChange = (event) => {
        const nextClassId = event.target.value;
        const nextClass = CLASS_CONFIGS[nextClassId];
        const nextSubject = nextClass.subjects?.[0] || "Chưa phân môn";
        const nextRecord = buildRecords(nextClass, nextSubject, selectedTerm, overrides)[0] || null;

        setSelectedClassId(nextClassId);
        setSelectedStudentId(nextRecord?.id || nextClass.students[0].id);
        setDraft(getDraftFromRecord(nextRecord));
        setSaveMessage("");
        setEntryDialogOpen(false);
        setEditDialogOpen(false);
        setAtRiskDialogOpen(false);
        setAtRiskCandidates([]);
        setEditStudentId(null);
    };

    const handleSelectStudent = (studentId) => {
        const nextRecord = currentRecords.find((item) => item.id === studentId) || currentRecords[0] || null;

        setSelectedStudentId(studentId);
        setDraft(getDraftFromRecord(nextRecord));
        setSaveMessage("");
    };

    const openEditDialog = (record) => {
        if (!record) return;

        setSelectedStudentId(record.id);
        setEditStudentId(record.id);
        setEditDraft(getDraftFromRecord(record));
        setEditDialogOpen(true);
        setSaveMessage("");
    };

    const openEntryDialog = () => {
        setEntryDialogOpen(true);
        setSaveMessage("");
    };

    const closeEntryDialog = () => {
        setEntryDialogOpen(false);
    };

    const closeEditDialog = () => {
        setEditDialogOpen(false);
        setEditStudentId(null);
    };

    const closeAtRiskDialog = () => {
        setAtRiskDialogOpen(false);
        setAtRiskCandidates([]);
    };

    const handleSave = () => {
        if (!selectedRecord) return;

        const nextScores = buildScoresFromDraft(draft, selectedRecord);

        setOverrides((prev) => ({
            ...prev,
            [selectedRecord.recordKey]: nextScores,
        }));
        setSaveMessage(`Đã cập nhật điểm cho ${selectedRecord.name} trong ${currentSubject} - ${semesterLabel}.`);
        window.alert(`Đã lưu điểm cho ${selectedRecord.name}.`);
        setDraft(getDraftFromRecord(nextScores));
        setEntryDialogOpen(false);
    };

    const handleSaveEditDialog = () => {
        if (!editRecord) return;

        const nextScores = buildScoresFromDraft(editDraft, editRecord);

        setOverrides((prev) => ({
            ...prev,
            [editRecord.recordKey]: nextScores,
        }));

        const nextRecord = {
            ...editRecord,
            ...nextScores,
            average: calculateAverage(nextScores),
            rank: getRank(calculateAverage(nextScores)),
            status: calculateAverage(nextScores) >= 5 ? "Đạt" : "Chưa đạt",
            note: nextScores.note,
        };

        setSelectedStudentId(nextRecord.id);
        setDraft(getDraftFromRecord(nextRecord));
        setSaveMessage(`Đã chỉnh sửa điểm cho ${nextRecord.name} trong ${currentSubject} - ${semesterLabel}.`);
        window.alert(`Đã lưu điểm cho ${nextRecord.name}.`);
        closeEditDialog();
    };

    const handleReset = () => {
        if (!selectedRecord) return;

        setDraft(getDraftFromRecord(selectedRecord));
        setSaveMessage("");
    };

    const editOralScores = editDraft.oralScores?.length ? editDraft.oralScores : [editDraft.oral ?? ""];
    const editTest15Scores = editDraft.test15Scores?.length ? editDraft.test15Scores : [editDraft.test15 ?? ""];
    const editOneTietScores = editDraft.oneTietScores?.length ? editDraft.oneTietScores : [editDraft.oneTiet ?? ""];
    const editMidterm = editDraft.midterm ?? "";

    const updateEditScoreList = (field, index, value, currentValues) => {
        const nextValues = [...currentValues];
        nextValues[index] = value;
        setEditDraft((prev) => ({ ...prev, [field]: nextValues }));
    };

    const addEditScoreField = (field, currentValues) => {
        setEditDraft((prev) => ({ ...prev, [field]: [...currentValues, ""] }));
    };

    return (
        <div className="teacher-grades-page">
            <PageHeader
                title="Quản lý điểm học sinh"
                eyebrow={`Tổng cộng: ${currentClass.students.length} học sinh`}
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
                <div className="teacher-grades-summary-header">
                    <GradeSummaryHeader subjectLabel={currentSubject} />
                </div>

                <div className="teacher-grades-toolbar">
                    <div className="teacher-grades-toolbar__group">
                        <Select
                            className="teacher-grades-select"
                            label="Chọn lớp"
                            value={selectedClassId}
                            variant="custom"
                            options={classOptions.map((classId) => ({ value: classId, label: CLASS_CONFIGS[classId].label }))}
                            onChange={handleClassChange}
                        />
                    </div>

                    <div className="teacher-grades-toolbar__center">
                        <span className="grade-entry-badge">{semesterLabel}</span>
                    </div>

                    <div className="teacher-grades-toolbar__meta">
                        <span className="grade-entry-badge teacher-grades-teacher-badge">Giảng viên chủ nhiệm: {currentClass.teacher || "Chưa phân công"}</span>
                    </div>

                </div>

                <div className="teacher-grades-summary-row">
                    <GradeSummarySection
                        stats={summaryStats}
                        onOpenStudent={handleOpenSummaryStudent}
                    />
                </div>
            </div>

            {saveMessage ? <div className="teacher-grades-notice">{saveMessage}</div> : null}

            <div className="teacher-grades-grid">
                <GradeListSection
                    records={currentRecords}
                    selectedStudentId={activeStudentId}
                    onSelectStudent={handleSelectStudent}
                    onOpenEditDialog={openEditDialog}
                    onOpenEntryDialog={openEntryDialog}
                    subjectLabel={currentSubject}
                    semesterLabel={semesterLabel}
                />
            </div>

            <Modal
                open={entryDialogOpen}
                title="Nhập & chỉnh sửa điểm"
                onClose={closeEntryDialog}
                className="teacher-grade-entry-modal"
            >
                <GradeEntrySection
                    classLabel={currentClass.label}
                    selectedRecord={selectedRecord}
                    draft={draft}
                    onDraftChange={(field, value) => setDraft((prev) => ({ ...prev, [field]: value }))}
                    onSave={handleSave}
                    onReset={handleReset}
                />
            </Modal>

            <Modal
                open={atRiskDialogOpen}
                title={`Danh sách học sinh cảnh báo (${atRiskCandidates.length})`}
                onClose={closeAtRiskDialog}
                className="teacher-grade-risk-modal"
            >
                <div className="teacher-grade-risk-list">
                    {atRiskCandidates.map((student) => (
                        <button
                            key={student.recordKey}
                            type="button"
                            className="teacher-grade-risk-item"
                            onClick={() => {
                                closeAtRiskDialog();
                                openEditDialog(student);
                            }}
                        >
                            <strong>{student.name}</strong>
                            <span>{student.code}</span>
                            <small>Điểm TB: {student.average.toFixed(1)}</small>
                        </button>
                    ))}
                </div>
            </Modal>

            <Modal
                open={editDialogOpen}
                title={editRecord ? `Chỉnh sửa điểm - ${editRecord.name}` : "Chỉnh sửa điểm"}
                onClose={closeEditDialog}
                className="teacher-grade-edit-modal"
            >
                {editRecord ? (
                    <form
                        className="teacher-grade-edit-form"
                        onSubmit={(event) => {
                            event.preventDefault();
                            handleSaveEditDialog();
                        }}
                    >
                        <div className="teacher-grade-edit-meta">
                            <span>{currentClass.label}</span>
                            <span>{currentSubject}</span>
                            <span>{semesterLabel}</span>
                        </div>

                        <section className="grade-entry-score-block">
                            <div className="grade-entry-score-block__head">
                                <span>Điểm miệng</span>
                                <button type="button" className="grade-entry-score-add-btn" onClick={() => addEditScoreField("oralScores", editOralScores)}>
                                    +
                                </button>
                            </div>

                            <div className="grade-entry-score-grid">
                                {editOralScores.map((value, index) => (
                                    <label key={`edit-oral-${index}`} className="grade-entry-field">
                                        <span>Miệng {index + 1}</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            value={value}
                                            onChange={(event) => updateEditScoreList("oralScores", index, event.target.value, editOralScores)}
                                        />
                                    </label>
                                ))}
                            </div>
                        </section>

                        <section className="grade-entry-score-block">
                            <div className="grade-entry-score-block__head">
                                <span>Điểm 15 phút</span>
                                <button type="button" className="grade-entry-score-add-btn" onClick={() => addEditScoreField("test15Scores", editTest15Scores)}>
                                    +
                                </button>
                            </div>

                            <div className="grade-entry-score-grid">
                                {editTest15Scores.map((value, index) => (
                                    <label key={`edit-test15-${index}`} className="grade-entry-field">
                                        <span>15 phút {index + 1}</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            value={value}
                                            onChange={(event) => updateEditScoreList("test15Scores", index, event.target.value, editTest15Scores)}
                                        />
                                    </label>
                                ))}
                            </div>
                        </section>

                        <section className="grade-entry-score-block">
                            <div className="grade-entry-score-block__head">
                                <span>Điểm 1 tiết</span>
                                <button type="button" className="grade-entry-score-add-btn" onClick={() => addEditScoreField("oneTietScores", editOneTietScores)}>
                                    +
                                </button>
                            </div>

                            <div className="grade-entry-score-grid">
                                {editOneTietScores.map((value, index) => (
                                    <label key={`edit-one-tiet-${index}`} className="grade-entry-field">
                                        <span>1 tiết {index + 1}</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            value={value}
                                            onChange={(event) => updateEditScoreList("oneTietScores", index, event.target.value, editOneTietScores)}
                                        />
                                    </label>
                                ))}
                            </div>
                        </section>

                        <label className="teacher-grade-edit-note">
                            <span>Giữa kỳ</span>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={editMidterm}
                                onChange={(event) => setEditDraft((prev) => ({ ...prev, midterm: event.target.value }))}
                            />
                        </label>

                        <label className="teacher-grade-edit-note">
                            <span>Cuối kỳ</span>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={editDraft.final}
                                onChange={(event) => setEditDraft((prev) => ({ ...prev, final: event.target.value }))}
                            />
                        </label>

                        <label className="teacher-grade-edit-note">
                            <span>Ghi chú</span>
                            <textarea
                                rows="3"
                                value={editDraft.note}
                                onChange={(event) => setEditDraft((prev) => ({ ...prev, note: event.target.value }))}
                                placeholder="Nhận xét ngắn về bài làm..."
                            />
                        </label>

                        <div className="teacher-grade-edit-actions">
                            <button type="button" className="teacher-grade-edit-btn is-ghost" onClick={closeEditDialog}>
                                Hủy
                            </button>
                            <button type="submit" className="teacher-grade-edit-btn is-primary">
                                Lưu thay đổi
                            </button>
                        </div>
                    </form>
                ) : null}
            </Modal>
        </div>
    );
}





