import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    FiArrowLeft, 
    FiSave, 
    FiCheckCircle, 
    FiSearch, 
    FiUser,
    FiAlertCircle
} from "react-icons/fi";
import { buildFinalScore } from "../../../../services/shared/quiz/quizService";
import { quizService } from "../../../../services/shared/quiz/quizService";
import { LoadingSpinner } from "../../../../components/common";
import QuestionItem from "../../../student/quiz/components/QuestionItem/QuestionItem";
import "./TeacherQuizSubmissions.css";

function normalizeQuestion(question = {}) {
    const answers = Array.isArray(question.answers) ? question.answers : [];
    const questionType = String(question.questionType || question.question_type || question.type || "").toLowerCase();

    return {
        id: question.id,
        type: questionType === "multiple_choice" ? "multiple-choice" : questionType,
        text: question.questionText || question.question_text || question.text || "",
        options: answers.map((answer) => answer.answerText || answer.answer_text || answer.text || "").filter(Boolean),
        correctAnswer:
            answers.find((answer) => answer.isCorrect || answer.is_correct)?.answerText ||
            answers.find((answer) => answer.isCorrect || answer.is_correct)?.answer_text ||
            "",
        points: Number(question.points || question.score || 0),
        essayMaxScore: Number(question.points || question.score || 0),
    };
}

function formatAttemptStudentName(attempt = {}) {
    const fullName = attempt.students
        ? `${attempt.students.given_name || ""} ${attempt.students.surname || ""}`.trim()
        : attempt.studentName || attempt.student_name || "";
    return fullName || attempt.students?.student_code || "Học sinh";
}

function formatDateTime(value) {
    if (!value) return "Chưa có thời gian";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("vi-VN");
}

function getDisplayStatus(attempt = {}, essayMaxScore = 0) {
    if (attempt.status === "graded") return "graded";
    if (attempt.status === "pending_review") return "pending";
    if (attempt.status === "submitted") {
        // Pure MC quiz: auto-graded by BE, no essay to grade → always graded
        if (essayMaxScore === 0) return "graded";
        // Mixed/essay quiz: only graded if teacher manually scored
        return Number(attempt.score_manual || attempt.scoreManual || 0) > 0 ? "graded" : "pending";
    }
    return "submitted";
}


export default function TeacherQuizSubmissions() {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [selectedAttemptId, setSelectedAttemptId] = useState(null);
    const [selectedAttemptDetail, setSelectedAttemptDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [draftScores, setDraftScores] = useState({});

    useEffect(() => {
        const controller = new AbortController();

        const loadQuizData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [quizRes, questionsRes, attemptsRes] = await Promise.all([
                    quizService.getQuizById(quizId),
                    quizService.listQuestions(quizId),
                    quizService.listAttempts(quizId, { page: 1, limit: 100 }),
                ]);

                if (controller.signal.aborted) return;

                setQuiz(quizRes);
                setQuestions(Array.isArray(questionsRes) ? questionsRes.map(normalizeQuestion) : []);

                const attemptRows = attemptsRes?.data?.attempts || attemptsRes?.data || attemptsRes?.attempts || [];
                const essayMaxScore = (Array.isArray(questionsRes) ? questionsRes : []).reduce((sum, question) => {
                    const type = String(question.questionType || question.question_type || question.type || "").toLowerCase();
                    return type === "essay" ? sum + Number(question.points || question.score || 0) : sum;
                }, 0);

                const normalizedAttempts = (Array.isArray(attemptRows) ? attemptRows : []).map((attempt) => {
                    const autoScore = Number(attempt.score_auto ?? attempt.scoreAuto ?? 0);
                    const manualScore = Number(attempt.score_manual ?? attempt.scoreManual ?? 0);
                    const totalScore = Number(attempt.total_score ?? attempt.totalScore ?? autoScore + manualScore);
                    return {
                        id: attempt.id,
                        studentName: formatAttemptStudentName(attempt),
                        submittedAt: formatDateTime(attempt.end_time || attempt.updated_at || attempt.start_time),
                        autoScore,
                        essayScore: manualScore,
                        essayMaxScore,
                        isEssayGraded: attempt.status === "graded" || essayMaxScore === 0 || attempt.status === "submitted",
                        status: getDisplayStatus(attempt, essayMaxScore),
                        totalScore,
                        raw: attempt,
                    };
                });

                setAttempts(normalizedAttempts);
                setSelectedAttemptId((current) => current ?? normalizedAttempts[0]?.id ?? null);
            } catch (loadError) {
                if (controller.signal.aborted) return;
                console.error("Load quiz attempts error:", loadError);
                setError("Không thể tải danh sách bài nộp.");
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        loadQuizData();

        return () => controller.abort();
    }, [quizId]);

    useEffect(() => {
        const loadAttemptDetail = async () => {
            if (!selectedAttemptId) {
                setSelectedAttemptDetail(null);
                return;
            }

            try {
                setDetailLoading(true);
                const detailRes = await quizService.getAttemptDetail(selectedAttemptId);
                setSelectedAttemptDetail(detailRes?.data || detailRes || null);
            } catch (detailError) {
                console.error("Load attempt detail error:", detailError);
                setSelectedAttemptDetail(null);
            } finally {
                setDetailLoading(false);
            }
        };

        loadAttemptDetail();
    }, [selectedAttemptId]);

    const filteredStudents = useMemo(() => {
        return attempts.filter((attempt) => {
            const matchesSearch = attempt.studentName.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterStatus === "all" || attempt.status === filterStatus;
            return matchesSearch && matchesFilter;
        });
    }, [attempts, searchTerm, filterStatus]);

    const selectedSubmission = useMemo(() => {
        return attempts.find((attempt) => attempt.id === selectedAttemptId) || null;
    }, [attempts, selectedAttemptId]);

    const responseByQuestionId = useMemo(() => {
        const responses = selectedAttemptDetail?.responses || [];
        return new Map(responses.map((response) => [response.question_id ?? response.questionId, response]));
    }, [selectedAttemptDetail]);

    const normalizedQuestions = useMemo(() => {
        return questions.map((question) => {
            const response = responseByQuestionId.get(question.id);
            const studentAnswer = response?.essay_answer || response?.quiz_answers?.answer_text || response?.answer_text || "";
            return {
                ...question,
                studentAnswer,
            };
        });
    }, [questions, responseByQuestionId]);

    useEffect(() => {
        if (!selectedSubmission) return;
        setDraftScores((prev) => ({
            ...prev,
            [selectedSubmission.id]: String(selectedSubmission.essayScore ?? 0),
        }));
    }, [selectedSubmission]);

    const handleSaveEssayScore = async () => {
        if (!selectedSubmission) return;
        const parsedScore = parseFloat(draftScores[selectedSubmission.id]) || 0;
        
        try {
            setSaving(true);
            const response = await quizService.gradeAttempt(selectedSubmission.id, {
                scoreManual: parsedScore,
            });

            if (response?.success) {
                setAttempts((prev) => prev.map((attempt) => {
                    if (attempt.id !== selectedSubmission.id) return attempt;
                    return {
                        ...attempt,
                        essayScore: parsedScore,
                        totalScore: Number(attempt.autoScore || 0) + parsedScore,
                        isEssayGraded: true,
                        status: "graded",
                    };
                }));

                const refreshedDetail = await quizService.getAttemptDetail(selectedSubmission.id);
                setSelectedAttemptDetail(refreshedDetail?.data || refreshedDetail || null);
            }
        } catch (saveError) {
            console.error("Save essay score error:", saveError);
        } finally {
            setSaving(false);
        }
    };

    const currentQuizTitle = quiz?.title || "Chi tiết bài nộp";

    if (loading) {
        return (
            <div className="teacher-quiz-subs-v2 teacher-quiz-subs-v2--loading">
                <LoadingSpinner size="lg" label="Đang tải bài nộp..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="teacher-quiz-subs-v2 teacher-quiz-subs-v2--error">
                <p>{error}</p>
                <button className="back-btn" onClick={() => navigate("/teacher/quiz")}>
                    <FiArrowLeft /> Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="teacher-quiz-subs-v2">
            <header className="teacher-quiz-subs-v2__header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate("/teacher/quiz")}>
                        <FiArrowLeft /> Quay lại
                    </button>
                    <div className="title-section">
                        <h1>Chi tiết bài nộp</h1>
                        <span className="quiz-tag">{currentQuizTitle}</span>
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
                            <button 
                                className={filterStatus === "graded" ? "active" : ""} 
                                onClick={() => setFilterStatus("graded")}
                            >Đã chấm</button>
                        </div>
                    </div>

                    <div className="student-list">
                        {filteredStudents.map(student => (
                            <div 
                                key={student.id} 
                                className={`student-item ${selectedAttemptId === student.id ? "selected" : ""}`}
                                onClick={() => setSelectedAttemptId(student.id)}
                            >
                                <div className="student-avatar">
                                    <FiUser />
                                </div>
                                <div className="student-meta">
                                    <span className="student-name">{student.studentName}</span>
                                    <span className={`status-text ${student.status}`}>
                                        {student.status === "graded" && "Đã chấm"}
                                        {student.status === "pending" && "Chờ chấm"}
                                        {student.status === "submitted" && "Đã nộp"}
                                    </span>
                                </div>
                                <div className="student-status-right">
                                    <span className="student-class-badge">{student.raw?.students?.student_code || `#${student.id}`}</span>
                                    {student.status === "graded" && <FiCheckCircle className="graded-icon" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main: Submission Detail */}
                <main className="submission-detail">
                    {selectedSubmission ? (
                        <div className="detail-content">
                            <div className="student-summary-header">
                                <div className="summary-info">
                                    <div className="summary-name-row">
                                        <h2>Bài làm của {selectedSubmission.studentName}</h2>
                                        <span className={`class-indicator ${selectedSubmission.status}`}>{selectedSubmission.status === "pending" ? "Chờ chấm" : "Đã chấm"}</span>
                                    </div>
                                    <span>Nộp lúc: {selectedSubmission.submittedAt}</span>
                                </div>
                                <div className="score-summary">
                                    <div className="score-box auto">
                                        <label>Trắc nghiệm</label>
                                        <strong>{Number(selectedSubmission.autoScore || 0).toFixed(1)}</strong>
                                    </div>
                                    <div className="score-box essay">
                                        <label>Tự luận</label>
                                        <strong>{Number(selectedSubmission.essayScore || 0).toFixed(1)}</strong>
                                    </div>
                                    <div className="score-box total">
                                        <label>Tổng điểm</label>
                                        <strong>{buildFinalScore({ autoScore: selectedSubmission.autoScore, essayScore: selectedSubmission.essayScore }).toFixed(1)}/10</strong>
                                    </div>
                                </div>
                            </div>

                            {detailLoading ? (
                                <div className="teacher-quiz-subs-v2__detail-loading">
                                    <LoadingSpinner size="md" label="Đang tải chi tiết bài nộp..." />
                                </div>
                            ) : null}

                            <div className="question-review-list">
                                {normalizedQuestions.map((question, idx) => (
                                    <QuestionItem
                                        key={question.id}
                                        question={question}
                                        index={idx}
                                        selectedAnswer={question.studentAnswer}
                                        onChoose={() => {}}
                                        disabled
                                        showResult
                                    />
                                ))}
                            </div>

                            {selectedSubmission.essayMaxScore > 0 ? (
                                <div className="essay-grading-area teacher-essay-grading-area">
                                    <div className="student-answer-box">
                                        <label>Điểm tự luận tổng:</label>
                                        <div className="input-wrapper">
                                            <input
                                                type="number"
                                                value={draftScores[selectedSubmission.id] || ""}
                                                step="0.25"
                                                min="0"
                                                max={selectedSubmission.essayMaxScore || 10}
                                                onChange={(e) => setDraftScores({ ...draftScores, [selectedSubmission.id]: e.target.value })}
                                            />
                                            <span>/ {selectedSubmission.essayMaxScore || 10}</span>
                                        </div>
                                    </div>
                                    {selectedSubmission.status !== "graded" || (draftScores[selectedSubmission.id] !== undefined && Number(draftScores[selectedSubmission.id]) !== Number(selectedSubmission.essayScore || 0)) ? (
                                        <button 
                                            className="save-score-btn"
                                            disabled={saving}
                                            onClick={handleSaveEssayScore}
                                        >
                                            <FiSave /> {saving ? "Đang lưu..." : "Lưu điểm"}
                                        </button>
                                    ) : (
                                        <div className="essay-graded-success-msg" style={{ marginTop: '16px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500' }}>
                                            <FiCheckCircle /> Đã lưu điểm thành công
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="essay-grading-area essay-grading-area--auto">
                                    <FiCheckCircle className="auto-graded-icon" />
                                    <span>Bài kiểm tra trắc nghiệm đã được chấm điểm tự động.</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <FiUser size={48} />
                            <h2>Chưa có bài nộp</h2>
                            <p>Danh sách bên trái sẽ hiển thị khi học sinh nộp bài.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}




