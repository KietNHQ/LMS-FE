import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiSearch, FiUser } from "react-icons/fi";
import { quizService } from "../../../../services/shared/quiz/quizService";
import "./ManagementQuizSubmissions.css";

const formatStudentName = (attempt = {}) => {
    const fromNested = `${attempt.students?.surname || ""} ${attempt.students?.given_name || ""}`.trim();
    return fromNested || attempt.studentName || `Học sinh #${attempt.student_id || "?"}`;
};

const normalizeStatus = (status) => {
    if (status === "graded") return "graded";
    if (status === "submitted" || status === "completed") return "pending";
    return "pending";
};

export default function ManagementQuizSubmissions() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [attempts, setAttempts] = useState([]);
    const [selectedAttemptId, setSelectedAttemptId] = useState(null);
    const [selectedAttemptDetail, setSelectedAttemptDetail] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [draftManualScore, setDraftManualScore] = useState(0);

    useEffect(() => {
        const loadAttempts = async () => {
            setIsLoading(true);
            try {
                const payload = await quizService.listAttempts(quizId, { page: 1, limit: 100 });
                const rows = payload?.data?.attempts || payload?.attempts || [];
                setAttempts(rows);
                if (rows.length) {
                    setSelectedAttemptId(rows[0].id);
                }
            } catch (error) {
                alert(error?.response?.data?.error || "Không tải được bài nộp.");
            } finally {
                setIsLoading(false);
            }
        };

        loadAttempts();
    }, [quizId]);

    useEffect(() => {
        if (!selectedAttemptId) {
            setSelectedAttemptDetail(null);
            return;
        }

        const loadDetail = async () => {
            try {
                const payload = await quizService.getAttemptDetail(selectedAttemptId);
                const detail = payload?.data || payload;
                setSelectedAttemptDetail(detail);
                setDraftManualScore(Number(detail?.score_manual || 0));
            } catch (error) {
                alert(error?.response?.data?.error || "Không tải được chi tiết bài nộp.");
            }
        };

        loadDetail();
    }, [selectedAttemptId]);

    const filteredStudents = useMemo(() => {
        return attempts.filter((attempt) => {
            const studentName = formatStudentName(attempt).toLowerCase();
            const matchesSearch = studentName.includes(searchTerm.toLowerCase());
            const matchesFilter =
                filterStatus === "all" || normalizeStatus(attempt.status) === filterStatus;
            return matchesSearch && matchesFilter;
        });
    }, [attempts, filterStatus, searchTerm]);

    const selectedSubmission = selectedAttemptDetail;

    const handleSaveManualScore = async () => {
        if (!selectedAttemptId) return;
        try {
            await quizService.gradeAttempt(selectedAttemptId, {
                scoreManual: draftManualScore,
                teacherComment: "Admin review",
            });

            setAttempts((prev) =>
                prev.map((item) =>
                    item.id === selectedAttemptId ? { ...item, status: "graded" } : item
                )
            );

            const refreshed = await quizService.getAttemptDetail(selectedAttemptId);
            setSelectedAttemptDetail(refreshed?.data || refreshed);
            alert("Đã lưu điểm tự luận.");
        } catch (error) {
            alert(error?.response?.data?.error || "Không lưu được điểm tự luận.");
        }
    };

    return (
        <div className="admin-quiz-subs">
            <header className="admin-quiz-subs__header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => {
                        const prefix = window.location.pathname.startsWith("/admin") ? "/admin" : "/management";
                        navigate(`${prefix}/quiz`);
                    }}>
                        <FiArrowLeft /> Quay lại
                    </button>
                    <div className="title-section">
                        <h1>Chi tiết bài nộp (Admin)</h1>
                        <span className="quiz-tag">Quiz #{quizId}</span>
                    </div>
                </div>
            </header>

            <div className="admin-quiz-subs__layout">
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
                        {isLoading ? <p>Đang tải...</p> : null}
                        {filteredStudents.map((attempt) => {
                            const studentName = formatStudentName(attempt);
                            const status = normalizeStatus(attempt.status);
                            return (
                            <div
                                key={attempt.id}
                                className={`student-item ${selectedAttemptId === attempt.id ? "selected" : ""}`}
                                onClick={() => setSelectedAttemptId(attempt.id)}
                            >
                                <div className="student-avatar">
                                    <FiUser />
                                </div>
                                <div className="student-meta">
                                    <span className="student-name">{studentName}</span>
                                    <span className={`status-text ${status}`}>
                                        {status === "graded" ? "Đã chấm" : "Chờ chấm"}
                                    </span>
                                </div>
                                <div className="student-status-right">
                                    <span className="student-class-badge">#{attempt.id}</span>
                                    {status === "graded" && <FiCheckCircle className="graded-icon" />}
                                </div>
                            </div>
                            );
                        })}
                    </div>
                </aside>

                {/* Main: Submission Detail */}
                <main className="submission-detail">
                    {!selectedSubmission ? (
                        <div className="empty-state">
                            <FiUser size={48} />
                            <h2>Chọn học sinh để xem chi tiết</h2>
                            <p>Danh sách bên trái hiển thị các bài nộp đã có.</p>
                        </div>
                    ) : (
                        <div className="detail-content">
                            <div className="student-summary-header">
                                <div className="summary-info">
                                    <div className="summary-name-row">
                                        <h2>Bài làm của {formatStudentName(selectedSubmission)}</h2>
                                        <span className="class-indicator">Attempt: #{selectedSubmission.id}</span>
                                    </div>
                                    <span>
                                        Nộp lúc: {selectedSubmission.end_time ? new Date(selectedSubmission.end_time).toLocaleString("vi-VN") : "--"}
                                    </span>
                                </div>
                                <div className="score-summary">
                                    <div className="score-box auto">
                                        <label>Trắc nghiệm</label>
                                        <strong>{Number(selectedSubmission.score_auto || 0).toFixed(1)}</strong>
                                    </div>
                                    <div className="score-box essay">
                                        <label>Tự luận</label>
                                        <strong>{Number(selectedSubmission.score_manual || 0).toFixed(1)}</strong>
                                    </div>
                                    <div className="score-box total">
                                        <label>Tổng điểm</label>
                                        <strong>{Number(selectedSubmission.total_score || 0).toFixed(1)}/10</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="grading-control" style={{ marginBottom: "1rem" }}>
                                <div className="input-group">
                                    <label>Điểm tự luận tổng:</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="number"
                                            step="0.25"
                                            min="0"
                                            max="10"
                                            value={draftManualScore}
                                            onChange={(e) => setDraftManualScore(Number(e.target.value || 0))}
                                        />
                                        <span>/ 10</span>
                                    </div>
                                </div>
                                <button className="save-score-btn" onClick={handleSaveManualScore}>
                                    Lưu điểm
                                </button>
                            </div>

                            <div className="question-review-list">
                                {(selectedSubmission.responses || []).map((response, idx) => {
                                    const questionType = response.quiz_questions?.question_type || "multiple_choice";
                                    return (
                                        <div key={response.id || `${response.question_id}-${idx}`} className={`review-question-item ${questionType}`}>
                                            <div className="question-header">
                                                <span className="q-number">Câu {idx + 1}</span>
                                                <p className="q-text">{response.quiz_questions?.question_text || "Không có nội dung"}</p>
                                                <span className={`q-type-badge ${questionType}`}>
                                                    {questionType === "essay" ? "Tự luận" : "Trắc nghiệm"}
                                                </span>
                                            </div>

                                            {questionType !== "essay" ? (
                                                <div className="options-review">
                                                    <div className={`review-option ${response.quiz_answers?.is_correct ? "selected-correct" : "selected-wrong"}`}>
                                                        <span className="opt-label">Đáp án chọn</span>
                                                        <span className="opt-text">{response.quiz_answers?.answer_text || "Không có"}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="essay-grading-area">
                                                    <div className="student-answer-box">
                                                        <label>Câu trả lời của học sinh:</label>
                                                        <div className="answer-text">
                                                            {response.essay_answer || <em>Không có câu trả lời</em>}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

