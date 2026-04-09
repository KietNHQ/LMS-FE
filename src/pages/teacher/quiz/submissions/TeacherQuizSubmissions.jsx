import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    FiArrowLeft, 
    FiSave, 
    FiCheckCircle, 
    FiClock, 
    FiSearch, 
    FiFilter, 
    FiUser,
    FiAlertCircle,
    FiCheck
} from "react-icons/fi";
import { buildFinalScore } from "../../../../services/shared/quiz/quizService";
import { DEFAULT_PROFILE_BY_ROLE } from "../../../../components/common/Dialog/ProfileDialog/profileData";
import { Tooltip } from "../../../../components/ui";
import "./TeacherQuizSubmissions.css";

// Enhanced Mock Data for this view
const MOCK_CLASS_LIST = [
    { id: "s-1", name: "Nguyễn Văn An", status: "graded", className: "10A1" },
    { id: "s-2", name: "Trần Mai Linh", status: "pending", className: "10A1" },
    { id: "s-3", name: "Lê Hồng Phúc", status: "not-submitted", className: "10A1" },
    { id: "s-4", name: "Phạm Minh Đức", status: "not-submitted", className: "10A2" },
    { id: "s-5", name: "Hoàng Thanh Hà", status: "pending", className: "10A2" },
    { id: "s-6", name: "Đặng Quang Huy", status: "graded", className: "10A2" },
    { id: "s-7", name: "Bùi Thị Lan", status: "not-submitted", className: "10A3" },
    { id: "s-8", name: "Ngô Anh Tuấn", status: "pending", className: "10A3" },
];

const initialQuizzes = [
    {
        id: 1,
        title: "Toán 10 - Kiểm tra 15 phút Chương 1",
        fullQuestions: [
            { id: 1, type: "multiple-choice", text: "1 + 1 bằng mấy?", options: ["1", "2", "3", "4"], correctAnswer: "2" },
            { id: 2, type: "multiple-choice", text: "Căn bậc hai của 16?", options: ["2", "4", "8", "6"], correctAnswer: "4" },
            { id: 3, type: "essay", text: "Nêu định nghĩa đạo hàm tại một điểm.", essayMaxScore: 2 },
        ],
        submissions: [
            {
                id: "s-1",
                studentName: "Nguyễn Văn An",
                submittedAt: "08/04/2026 08:15",
                autoScore: 5.0,
                essayScore: 1.25,
                essayMaxScore: 2,
                isEssayGraded: true,
                answers: { 1: "2", 2: "2", 3: "Em trình bày đúng định lý và có ví dụ minh họa." }
            },
            {
                id: "s-2",
                studentName: "Trần Mai Linh",
                submittedAt: "08/04/2026 08:22",
                autoScore: 10.0,
                essayScore: 0,
                essayMaxScore: 2,
                isEssayGraded: false,
                answers: { 1: "2", 2: "4", 3: "Bài làm có ý chính nhưng thiếu bước biến đổi cuối." }
            },
            {
                id: "s-5",
                studentName: "Hoàng Thanh Hà",
                submittedAt: "08/04/2026 09:10",
                autoScore: 0.0,
                essayScore: 0,
                essayMaxScore: 2,
                isEssayGraded: false,
                answers: { 1: "1", 2: "8", 3: "Chưa hoàn thành." }
            },
            {
                id: "s-6",
                studentName: "Đặng Quang Huy",
                submittedAt: "08/04/2026 09:45",
                autoScore: 5.0,
                essayScore: 2.0,
                essayMaxScore: 2,
                isEssayGraded: true,
                answers: { 1: "2", 2: "8", 3: "Đầy đủ và chính xác." }
            },
            {
                id: "s-8",
                studentName: "Ngô Anh Tuấn",
                submittedAt: "08/04/2026 10:30",
                autoScore: 5.0,
                essayScore: 0,
                essayMaxScore: 2,
                isEssayGraded: false,
                answers: { 1: "2", 2: "6", 3: "Có nỗ lực nhưng sai công thức." }
            }
        ]
    }
];

export default function TeacherQuizSubmissions() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(() => initialQuizzes.find(q => q.id === Number(quizId)) || initialQuizzes[0]);
    
    const [selectedStudentId, setSelectedStudentId] = useState("s-1");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [draftScores, setDraftScores] = useState({});

    const filteredStudents = useMemo(() => {
        return MOCK_CLASS_LIST.filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterStatus === "all" || student.status === filterStatus;
            return matchesSearch && matchesFilter;
        });
    }, [searchTerm, filterStatus]);

    const selectedSubmission = useMemo(() => {
        return quiz.submissions.find(s => s.id === selectedStudentId);
    }, [quiz.submissions, selectedStudentId]);

    const selectedStudentInfo = useMemo(() => {
        return MOCK_CLASS_LIST.find(s => s.id === selectedStudentId);
    }, [selectedStudentId]);

    const handleSaveEssayScore = (questionId, score) => {
        const submissionId = selectedStudentId;
        const parsedScore = parseFloat(score) || 0;
        
        setQuiz(prev => {
            const nextSubmissions = prev.submissions.map(s => {
                if (s.id !== submissionId) return s;
                return {
                    ...s,
                    essayScore: parsedScore,
                    isEssayGraded: true
                };
            });
            return { ...prev, submissions: nextSubmissions };
        });

        // Update mock class list status as well for purely visual consistency in this demo
        const studentIndex = MOCK_CLASS_LIST.findIndex(s => s.id === submissionId);
        if (studentIndex > -1) {
            MOCK_CLASS_LIST[studentIndex].status = "graded";
        }

        alert("Đã lưu điểm câu hỏi tự luận.");
    };

    const getAnswerLabel = (index) => ["A", "B", "C", "D"][index];

    return (
        <div className="teacher-quiz-subs-v2">
            <header className="teacher-quiz-subs-v2__header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate("/teacher/quiz")}>
                        <FiArrowLeft /> Quay lại
                    </button>
                    <div className="title-section">
                        <h1>Chi tiết bài nộp</h1>
                        <span className="quiz-tag">{quiz.title}</span>
                    </div>
                </div>
            </header>

            <div className="teacher-quiz-subs-v2__layout">
                {/* Sidebar: Student List */}
                <aside className="student-sidebar">
                    <div className="sidebar-header">
                        <div className="search-box">
                            <FiSearch />
                            <input 
                                type="text" 
                                placeholder="Tìm học sinh..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="filter-chips">
                            <button 
                                className={filterStatus === "all" ? "active" : ""} 
                                onClick={() => setFilterStatus("all")}
                            >Tất cả</button>
                            <button 
                                className={filterStatus === "pending" ? "active" : ""} 
                                onClick={() => setFilterStatus("pending")}
                            >Chờ chấm</button>
                        </div>
                    </div>

                    <div className="student-list">
                        {filteredStudents.map(student => (
                            <div 
                                key={student.id} 
                                className={`student-item ${selectedStudentId === student.id ? "selected" : ""}`}
                                onClick={() => setSelectedStudentId(student.id)}
                            >
                                <div className="student-avatar">
                                    <FiUser />
                                </div>
                                <div className="student-meta">
                                    <span className="student-name">{student.name}</span>
                                    <span className={`status-text ${student.status}`}>
                                        {student.status === "graded" && "Đã chấm"}
                                        {student.status === "pending" && "Chờ chấm"}
                                        {student.status === "not-submitted" && "Chưa nộp"}
                                    </span>
                                </div>
                                <div className="student-status-right">
                                    <span className="student-class-badge">{student.className}</span>
                                    {student.status === "graded" && <FiCheckCircle className="graded-icon" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main: Submission Detail */}
                <main className="submission-detail">
                    {selectedStudentInfo?.status === "not-submitted" ? (
                        <div className="empty-state">
                            <FiAlertCircle size={48} />
                            <h2>Học sinh chưa nộp bài</h2>
                            <p>Phần này sẽ hiển thị bài làm ngay khi học sinh hoàn tất bài kiểm tra.</p>
                        </div>
                    ) : selectedSubmission ? (
                        <div className="detail-content">
                            <div className="student-summary-header">
                                <div className="summary-info">
                                    <div className="summary-name-row">
                                        <h2>Bài làm của {selectedSubmission.studentName}</h2>
                                        <span className="class-indicator">Lớp: {selectedStudentInfo?.className}</span>
                                    </div>
                                    <span>Nộp lúc: {selectedSubmission.submittedAt}</span>
                                </div>
                                <div className="score-summary">
                                    <div className="score-box auto">
                                        <label>Trắc nghiệm</label>
                                        <strong>{selectedSubmission.autoScore.toFixed(1)}</strong>
                                    </div>
                                    <div className="score-box essay">
                                        <label>Tự luận</label>
                                        <strong>{selectedSubmission.essayScore.toFixed(1)}</strong>
                                    </div>
                                    <div className="score-box total">
                                        <label>Tổng điểm</label>
                                        <strong>{Math.min(10, selectedSubmission.autoScore + selectedSubmission.essayScore).toFixed(1)}/10</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="question-review-list">
                                {quiz.fullQuestions.map((q, idx) => {
                                    const studentAnswer = selectedSubmission.answers[q.id];
                                    const isCorrect = q.type === "multiple-choice" && studentAnswer === q.correctAnswer;
                                    
                                    return (
                                        <div key={q.id} className={`review-question-item ${q.type}`}>
                                            <div className="question-header">
                                                <span className="q-number">Câu {idx + 1}</span>
                                                <p className="q-text">{q.text}</p>
                                                <span className={`q-type-badge ${q.type}`}>
                                                    {q.type === "multiple-choice" ? "Trắc nghiệm" : "Tự luận"}
                                                </span>
                                            </div>

                                            {q.type === "multiple-choice" ? (
                                                <div className="options-review">
                                                    {q.options.map((opt, oIdx) => {
                                                        const label = getAnswerLabel(oIdx);
                                                        const isSelected = studentAnswer === opt;
                                                        const isRight = opt === q.correctAnswer;
                                                        
                                                        let optClass = "";
                                                        if (isSelected) optClass = isRight ? "selected-correct" : "selected-wrong";
                                                        if (isRight) optClass = "correct-option";

                                                        return (
                                                            <div key={opt} className={`review-option ${optClass}`}>
                                                                <span className="opt-label">{label}</span>
                                                                <span className="opt-text">{opt}</span>
                                                                {isSelected && (isRight ? <FiCheckCircle /> : <FiAlertCircle />)}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="essay-grading-area">
                                                    <div className="student-answer-box">
                                                        <label>Câu trả lời của học sinh:</label>
                                                        <div className="answer-text">
                                                            {studentAnswer || <em>Không có câu trả lời</em>}
                                                        </div>
                                                    </div>
                                                    <div className="grading-control">
                                                        <div className="input-group">
                                                            <label>Chấm điểm (Tối đa {q.essayMaxScore}):</label>
                                                            <div className="input-wrapper">
                                                                <input 
                                                                    type="number" 
                                                                    defaultValue={selectedSubmission.essayScore}
                                                                    step="0.25"
                                                                    min="0"
                                                                    max={q.essayMaxScore}
                                                                    onChange={(e) => setDraftScores({...draftScores, [q.id]: e.target.value})}
                                                                />
                                                                <span>/ {q.essayMaxScore}</span>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            className="save-score-btn"
                                                            onClick={() => handleSaveEssayScore(q.id, draftScores[q.id] || selectedSubmission.essayScore)}
                                                        >
                                                            <FiSave /> Lưu điểm
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <FiUser size={48} />
                            <h2>Chọn học sinh để xem chi tiết</h2>
                            <p>Danh sách bên trái hiển thị toàn bộ học sinh trong lớp.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
