import React, { useMemo, useState } from "react";
import { FiPlus, FiSave } from "react-icons/fi";
import "./TeacherQuiz.css";

import CreateEditQuizSection from "./components/createEditQuizSection/CreateEditQuizSection";
import AssignQuizSection from "./components/assignQuizSection/AssignQuizSection";
import QuizListSection from "./components/quizListSection/QuizListSection";

const initialQuizzes = [
    {
        id: 1,
        title: "Kiểm tra Toán chương 1",
        subject: "Toán",
        className: "10A1",
        duration: "45 phút",
        questions: [
            {
                id: 101,
                question: "Giá trị của x trong phương trình 2x + 4 = 10 là?",
                answers: {
                    A: "2",
                    B: "3",
                    C: "4",
                    D: "5",
                },
                correctAnswer: "B",
                score: 0.5,
            },
            {
                id: 102,
                question: "Diện tích hình tròn bán kính r là?",
                answers: {
                    A: "πr",
                    B: "2πr",
                    C: "πr²",
                    D: "2πr²",
                },
                correctAnswer: "C",
                score: 0.5,
            },
        ],
    },
    {
        id: 2,
        title: "Kiểm tra Toán chương 2",
        subject: "Toán",
        className: "10A2",
        duration: "45 phút",
        questions: [],
    },
];

const emptyForm = {
    question: "",
    answers: {
        A: "",
        B: "",
        C: "",
        D: "",
    },
    correctAnswer: "A",
    score: "0.5",
};

export default function TeacherQuiz() {
    const [quizzes, setQuizzes] = useState(initialQuizzes);
    const [activeQuizId, setActiveQuizId] = useState(initialQuizzes[1].id);
    const [formData, setFormData] = useState(emptyForm);
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);

    const activeQuiz = useMemo(
        () => quizzes.find((quiz) => quiz.id === activeQuizId),
        [quizzes, activeQuizId]
    );

    const handleChangeQuestion = (value) => {
        setFormData((prev) => ({
            ...prev,
            question: value,
        }));
    };

    const handleChangeAnswer = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            answers: {
                ...prev.answers,
                [key]: value,
            },
        }));
    };

    const handleSelectCorrect = (key) => {
        setFormData((prev) => ({
            ...prev,
            correctAnswer: key,
        }));
    };

    const handleScoreChange = (value) => {
        setFormData((prev) => ({
            ...prev,
            score: value,
        }));
    };

    const resetForm = () => {
        setFormData(emptyForm);
        setEditingQuestionId(null);
        setShowAddQuestionForm(false);
    };

    const validateForm = () => {
        const trimmedQuestion = formData.question.trim();
        const trimmedAnswers = Object.values(formData.answers).map((item) =>
            item.trim()
        );

        if (!trimmedQuestion) {
            alert("Vui lòng nhập câu hỏi.");
            return false;
        }

        if (trimmedAnswers.some((item) => !item)) {
            alert("Vui lòng nhập đầy đủ 4 đáp án.");
            return false;
        }

        if (!formData.correctAnswer) {
            alert("Vui lòng chọn đáp án đúng.");
            return false;
        }

        return true;
    };

    const handleAddOrUpdateQuestion = () => {
        if (!validateForm()) return;

        const questionPayload = {
            id: editingQuestionId ?? Date.now(),
            question: formData.question.trim(),
            answers: {
                A: formData.answers.A.trim(),
                B: formData.answers.B.trim(),
                C: formData.answers.C.trim(),
                D: formData.answers.D.trim(),
            },
            correctAnswer: formData.correctAnswer,
            score: Number(formData.score) || 0.5,
        };

        setQuizzes((prev) =>
            prev.map((quiz) => {
                if (quiz.id !== activeQuizId) return quiz;

                if (editingQuestionId) {
                    return {
                        ...quiz,
                        questions: quiz.questions.map((item) =>
                            item.id === editingQuestionId ? questionPayload : item
                        ),
                    };
                }

                return {
                    ...quiz,
                    questions: [...quiz.questions, questionPayload],
                };
            })
        );

        resetForm();
    };

    const handleDeleteQuestion = (questionId) => {
        const confirmed = window.confirm("Bạn có chắc muốn xoá câu hỏi này không?");
        if (!confirmed) return;

        setQuizzes((prev) =>
            prev.map((quiz) =>
                quiz.id === activeQuizId
                    ? {
                        ...quiz,
                        questions: quiz.questions.filter((item) => item.id !== questionId),
                    }
                    : quiz
            )
        );

        if (editingQuestionId === questionId) {
            resetForm();
        }
    };

    const handleEditQuestion = (question) => {
        setEditingQuestionId(question.id);
        setFormData({
            question: question.question,
            answers: {
                A: question.answers.A,
                B: question.answers.B,
                C: question.answers.C,
                D: question.answers.D,
            },
            correctAnswer: question.correctAnswer,
            score: String(question.score),
        });
        setShowAddQuestionForm(true);

        setTimeout(() => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
            });
        }, 100);
    };

    const handleMoveQuestion = (questionId, direction) => {
        setQuizzes((prev) =>
            prev.map((quiz) => {
                if (quiz.id !== activeQuizId) return quiz;

                const currentIndex = quiz.questions.findIndex(
                    (item) => item.id === questionId
                );
                if (currentIndex === -1) return quiz;

                const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

                if (targetIndex < 0 || targetIndex >= quiz.questions.length) {
                    return quiz;
                }

                const newQuestions = [...quiz.questions];
                [newQuestions[currentIndex], newQuestions[targetIndex]] = [
                    newQuestions[targetIndex],
                    newQuestions[currentIndex],
                ];

                return {
                    ...quiz,
                    questions: newQuestions,
                };
            })
        );
    };

    const handleSaveQuiz = () => {
        console.log("Saved quizzes:", quizzes);
        alert("Đã lưu quiz thành công.");
    };

    const handleOpenAddForm = () => {
        setEditingQuestionId(null);
        setFormData(emptyForm);
        setShowAddQuestionForm(true);

        setTimeout(() => {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
            });
        }, 100);
    };

    return (
        <div className="teacher-quiz-page">
            <div className="quiz-header">
                <div>
                    <h1>Soạn thảo Quiz</h1>

                </div>

                <button className="save-btn" onClick={handleSaveQuiz}>
                    <FiSave className="save-btn-icon" aria-hidden="true" />
                    <span>Lưu quiz</span>
                </button>
            </div>

            <div className="quiz-tabs">
                {quizzes.map((quiz) => (
                    <button
                        key={quiz.id}
                        type="button"
                        className={`quiz-tab ${activeQuizId === quiz.id ? "active" : ""}`}
                        onClick={() => {
                            setActiveQuizId(quiz.id);
                            resetForm();
                        }}
                    >
                        <h3>{quiz.title}</h3>
                        <span>
              {quiz.className} • {quiz.duration.replace(" phút", "p")}
            </span>
                    </button>
                ))}
            </div>

            <CreateEditQuizSection activeQuiz={activeQuiz} />

            <QuizListSection
                questions={activeQuiz?.questions || []}
                onDelete={handleDeleteQuestion}
                onEdit={handleEditQuestion}
                onMove={handleMoveQuestion}
            />

            {!showAddQuestionForm && (
                <button
                    type="button"
                    className="open-add-question-btn"
                    onClick={handleOpenAddForm}
                >
                    <FiPlus className="open-add-question-icon" aria-hidden="true" />
                    <span>Thêm câu hỏi mới</span>
                </button>
            )}

            {showAddQuestionForm && (
                <AssignQuizSection
                    formData={formData}
                    editingQuestionId={editingQuestionId}
                    onChangeQuestion={handleChangeQuestion}
                    onChangeAnswer={handleChangeAnswer}
                    onSelectCorrect={handleSelectCorrect}
                    onScoreChange={handleScoreChange}
                    onCancel={resetForm}
                    onSubmit={handleAddOrUpdateQuestion}
                />
            )}
        </div>
    );
}