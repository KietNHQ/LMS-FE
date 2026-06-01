import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSchoolYearTerm } from "../../../hooks/useSchoolYearTerm";
import { teacherGradeService } from "../../../services/pages/teacher/teacherGradeService";
import { resolveSchoolYearId } from "../../../services/shared/schoolYearLookup";
import { FiArrowLeft, FiChevronDown } from "react-icons/fi";
import {
    FaSquareRootAlt, FaAtom, FaFlask, FaBookOpen, FaLanguage,
    FaGraduationCap, FaLaptopCode, FaGlobeAsia, FaDumbbell,
    FaPalette, FaMusic, FaMicroscope,
} from "react-icons/fa";
import { BiLeaf, BiBook, BiTrophy, BiMedal, BiTrendingUp, BiTrendingDown, BiMinus, BiSearch } from "react-icons/bi";
import "../../student/grades/StudentGrades.css";

function round2(num) {
    return Number(num.toFixed(2));
}

function getAcademicRank(avg) {
    if (avg >= 8) return "Giỏi";
    if (avg >= 6.5) return "Khá";
    if (avg >= 5) return "Trung bình";
    return "Yếu";
}

function getTrend(hk1Avg, hk2Avg) {
    if (hk2Avg > hk1Avg) return "up";
    if (hk2Avg < hk1Avg) return "down";
    return "same";
}

const subjectIconMap = {
    "toán": FaSquareRootAlt,
    "vật lý": FaAtom,
    "hóa học": FaFlask,
    "ngữ văn": FaBookOpen,
    "tiếng anh": FaLanguage,
    "sinh học": FaMicroscope,
    "lịch sử": BiBook,
    "địa lý": FaGlobeAsia,
    "tin học": FaLaptopCode,
    "giáo dục công dân": FaGlobeAsia,
    "thể dục": FaDumbbell,
    "mỹ thuật": FaPalette,
    "âm nhạc": FaMusic,
    "công nghệ": BiLeaf,
};

function getSubjectIcon(subjectName) {
    const normalizedName = subjectName?.trim().toLowerCase() || "";
    return subjectIconMap[normalizedName] || FaGraduationCap;
}

function getRankClass(rank) {
    if (rank === "Giỏi") return "good";
    if (rank === "Khá") return "fair";
    return "weak";
}

export default function StudentGradeDetail() {
    const { enrollmentId } = useParams();
    const navigate = useNavigate();
    const { selectedSchoolYear, selectedTerm } = useSchoolYearTerm();

    const [student, setStudent] = useState(null);
    const [subjectGrades, setSubjectGrades] = useState([]);
    const [activeTab, setActiveTab] = useState("hk1");
    const [openSubjectId, setOpenSubjectId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch both teaching assignments AND homeroom class
                const [assignmentsRes, teachingClassesRes] = await Promise.all([
                    teacherGradeService.getMyAssignments({ schoolYear: selectedSchoolYear }),
                    import("../../../services/shared/http/axiosClient").then(m => m.default.get("/teachers/me/teaching-classes", { params: { schoolYear: selectedSchoolYear } }).then(r => r?.data?.data ?? [])),
                ]);

                const assignments = Array.isArray(assignmentsRes) ? assignmentsRes : [];
                const teachingClasses = Array.isArray(teachingClassesRes) ? teachingClassesRes : [];

                // Collect all class IDs the teacher is involved in
                const allClassIds = new Set([
                    ...assignments.map(a => a.class_id).filter(Boolean),
                    ...teachingClasses.map(c => c.class_id || c.id).filter(Boolean),
                ]);

                let foundStudent = null;
                let foundClassName = "";
                let foundEnrollmentId = null;

                for (const classId of allClassIds) {
                    const studentsRes = await teacherGradeService.getClassStudents(Number(classId));
                    const studentList = Array.isArray(studentsRes) ? studentsRes : [];
                    const match = studentList.find(
                        (s) => String(s.enrollment_id || s.id) === String(enrollmentId)
                    );
                    if (match) {
                        foundStudent = match;
                        foundEnrollmentId = match.enrollment_id || match.id;
                        // Prefer class name from teachingClasses, fallback from assignments
                        const tc = teachingClasses.find(c => String(c.class_id || c.id) === String(classId));
                        const as = assignments.find(a => String(a.class_id) === String(classId));
                        foundClassName = tc?.class_name || as?.class_name || "";
                        break;
                    }
                }

                if (!foundStudent) {
                    setIsLoading(false);
                    return;
                }

                const studentId = foundStudent.user_id;

                setStudent({
                    id: studentId,
                    enrollmentId: String(foundEnrollmentId),
                    fullName: `${foundStudent.surname || ""} ${foundStudent.given_name || ""}`.trim() || foundStudent.full_name || foundStudent.name || "—",
                    code: foundStudent.student_code || foundStudent.code || `HS${enrollmentId}`,
                    className: foundClassName,
                });

                // Resolve school year name (string) to integer ID
                const schoolYearId = await resolveSchoolYearId(selectedSchoolYear);

                const summaryRes = await teacherGradeService.getStudentGradeSummary({
                    studentId,
                    schoolYear: schoolYearId,
                    term: selectedTerm,
                });

                const wrapper = summaryRes?.data ?? summaryRes ?? {};
                const subjects = Array.isArray(wrapper.subjects)
                    ? wrapper.subjects
                    : Array.isArray(wrapper)
                    ? wrapper
                    : [];

                const processed = subjects.map((s) => ({
                    id: s.id,
                    name: s.name || s.subject_name || "—",
                    className: s.className || foundClassName,
                    hk1Avg: s.hk1Avg ?? s.hk1?.averageScore ?? null,
                    hk2Avg: s.hk2Avg ?? s.hk2?.averageScore ?? null,
                    yearAvg: s.yearAvg ?? s.year?.averageScore ?? null,
                    yearIsComplete: s.yearIsComplete ?? true,
                    rank: getAcademicRank(s.yearAvg ?? s.year?.averageScore ?? 0),
                    trend: getTrend(
                        s.hk1Avg ?? s.hk1?.averageScore ?? 0,
                        s.hk2Avg ?? s.hk2?.averageScore ?? 0
                    ),
                    hk1: s.hk1 || {},
                    hk2: s.hk2 || {},
                }));

                setSubjectGrades(processed);
            } catch (e) {
                console.error("Error fetching student grades:", e);
            } finally {
                setIsLoading(false);
            }
        };

        if (enrollmentId && selectedSchoolYear) {
            fetchData();
        }
    }, [enrollmentId, selectedSchoolYear, selectedTerm]);

    const overallAvg = useMemo(() => {
        const valid = subjectGrades.filter((g) => g.yearAvg != null);
        if (!valid.length) return 0;
        return round2(valid.reduce((a, b) => a + b.yearAvg, 0) / valid.length);
    }, [subjectGrades]);

    const rankLabel = getAcademicRank(overallAvg);

    return (
        <div className="grades-page">
            {/* Back button */}
            <div style={{ marginBottom: 16 }}>
                <button
                    className="btn-back"
                    onClick={() => navigate("/teacher/grades")}
                >
                    <FiArrowLeft style={{ marginRight: 6 }} /> Quay lại
                </button>
            </div>

            {/* Page title */}
            <div className="grades-header">
                <h1 className="grades-title">
                    Kết quả học tập
                    {student && (
                        <span style={{ fontSize: 16, fontWeight: 600, color: "#64748b", marginLeft: 12 }}>
                            {student.code} — {student.fullName} | {student.className}
                        </span>
                    )}
                </h1>
            </div>

            {isLoading ? (
                <div className="layout-loading-wrapper" style={{ minHeight: 300 }}>
                    <div className="teacher-grades-loading">
                        <div className="spinner"></div>
                        <p>Đang tải bảng điểm...</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Toolbar */}
                    <div className="grades-toolbar">
                        <div className="grades-tabs">
                            {["hk1", "hk2", "year"].map((tab) => (
                                <button
                                    key={tab}
                                    className={`grades-tab-btn ${activeTab === tab ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab === "hk1" ? "Học kỳ 1" : tab === "hk2" ? "Học kỳ 2" : "Cả năm"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grades-stats">
                        <div className="grades-card">
                            <div className="grades-card-icon icon-blue">
                                <BiTrophy />
                            </div>
                            <div className="grades-card-content">
                                <h2 className="blue">{overallAvg.toFixed(2)}</h2>
                                <p>{activeTab === "year" ? "TB Cả năm" : `TB Học kỳ ${activeTab === "hk1" ? "1" : "2"}`}</p>
                            </div>
                        </div>
                        <div className="grades-card">
                            <div className={`grades-card-icon ${rankLabel === "Giỏi" ? "icon-gold" : "icon-silver"}`}>
                                {rankLabel === "Giỏi" ? <BiTrophy /> : <BiMedal />}
                            </div>
                            <div className="grades-card-content">
                                <h2 className={rankLabel === "Giỏi" ? "rank-good-text" : "rank-fair-text"}>{rankLabel}</h2>
                                <p>Xếp loại học lực</p>
                            </div>
                        </div>
                        <div className="grades-card">
                            <div className="grades-card-icon icon-green">
                                <BiBook />
                            </div>
                            <div className="grades-card-content">
                                <h2 className="green">{subjectGrades.length}</h2>
                                <p>Số môn học</p>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="grades-table">
                        <div className="table-header">
                            <span>Môn học</span>
                            <span>TB HK1</span>
                            <span>TB HK2</span>
                            <span>TB Tổng</span>
                            <span className="progress-header">Xu hướng</span>
                            <span>Xếp loại</span>
                            <span>Chi tiết</span>
                        </div>

                        {subjectGrades.length > 0 ? subjectGrades.map((subject) => (
                            <div key={subject.id}>
                                <div className="table-row">
                                    <div className="subject">
                                        <div className="subject-icon">
                                            {React.createElement(getSubjectIcon(subject.name))}
                                        </div>
                                        <div>
                                            <b>{subject.name}</b>
                                            <p>{subject.className || student?.className || "Lớp học"}</p>
                                        </div>
                                    </div>
                                    <span>{(subject.hk1Avg ?? 0).toFixed(2)}</span>
                                    <span>{(subject.hk2Avg ?? 0).toFixed(2)}</span>
                                    <span className="total">
                                        {(activeTab === "hk1" ? subject.hk1Avg : activeTab === "hk2" ? subject.hk2Avg : subject.yearAvg ?? 0)?.toFixed(2)}
                                        {activeTab === "year" && subject.yearIsComplete === false && (
                                            <small style={{ marginLeft: 8, color: "#888" }}>(Tạm tính)</small>
                                        )}
                                    </span>
                                    <span className={`trend-cell ${subject.trend}`}>
                                        {subject.trend === "up" ? <BiTrendingUp /> : subject.trend === "down" ? <BiTrendingDown /> : <BiMinus />}
                                    </span>
                                    <span className={`rank rank-${getRankClass(subject.rank)}`}>{subject.rank}</span>
                                    <button
                                        className={`detail-toggle ${openSubjectId === subject.id ? "open" : ""}`}
                                        onClick={() => setOpenSubjectId(openSubjectId === subject.id ? null : subject.id)}
                                    >
                                        <FiChevronDown />
                                    </button>
                                </div>

                                {openSubjectId === subject.id && (
                                    <div className="detail-collapse expanded">
                                        <SubjectDetail subject={subject} />
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="empty-table-state">
                                <div className="empty-state-icon">
                                    <BiSearch />
                                </div>
                                <div className="empty-state-content">
                                    <h3>Không có dữ liệu điểm</h3>
                                    <p>Học sinh chưa có điểm trong năm học này.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

function SubjectDetail({ subject }) {
    const renderRegularGrades = (regularGrades = []) => {
        if (!regularGrades || regularGrades.length === 0) return <strong>—</strong>;
        return (
            <div className="regular-grades-list">
                {regularGrades.map((g, idx) => (
                    <span key={idx} className="grade-chip">{`KT TX lần ${idx + 1}: ${g}`}</span>
                ))}
            </div>
        );
    };

    const yearIsComplete = subject.yearIsComplete !== undefined ? subject.yearIsComplete : true;

    const hk1Breakdown = subject.hk1?.breakdown || {};
    const hk2Breakdown = subject.hk2?.breakdown || {};

    return (
        <div className="table-detail-row">
            <div className="detail-panels">
                <div className="detail-card">
                    <h3>Học kỳ 1</h3>
                    <div className="detail-item">
                        <span>Thường xuyên</span>
                        {renderRegularGrades(hk1Breakdown.regularGrades)}
                    </div>
                    <div className="detail-item">
                        <span>Giữa kỳ</span>
                        <strong>{hk1Breakdown.midtermScore ?? "—"}</strong>
                    </div>
                    <div className="detail-item">
                        <span>Cuối kỳ</span>
                        <strong>{hk1Breakdown.finalScore ?? "—"}</strong>
                    </div>
                    <div className="detail-divider" />
                    <div className="detail-item detail-average">
                        <span>Điểm trung bình HK1</span>
                        <strong>{(subject.hk1Avg ?? 0).toFixed(2)}</strong>
                    </div>
                </div>
                <div className="detail-card">
                    <h3>Học kỳ 2</h3>
                    <div className="detail-item">
                        <span>Thường xuyên</span>
                        {renderRegularGrades(hk2Breakdown.regularGrades)}
                    </div>
                    <div className="detail-item">
                        <span>Giữa kỳ</span>
                        <strong>{hk2Breakdown.midtermScore ?? "—"}</strong>
                    </div>
                    <div className="detail-item">
                        <span>Cuối kỳ</span>
                        <strong>{hk2Breakdown.finalScore ?? "—"}</strong>
                    </div>
                    <div className="detail-divider" />
                    <div className="detail-item detail-average">
                        <span>Điểm trung bình HK2</span>
                        <strong>{(subject.hk2Avg ?? 0).toFixed(2)}</strong>
                    </div>
                </div>
            </div>
            <div className="year-summary-card">
                <div className="year-summary-item">
                    <span>Điểm cả năm</span>
                    <strong>
                        {(subject.yearAvg ?? 0).toFixed(2)}
                        {!yearIsComplete && <small style={{ marginLeft: 8, color: "#888" }}>(Tạm tính)</small>}
                    </strong>
                </div>
                <div className="year-summary-item">
                    <span>Xếp loại</span>
                    <strong>{subject.rank}</strong>
                </div>
            </div>
        </div>
    );
}
