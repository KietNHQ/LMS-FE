import React from "react";
import QuizListSection from "./components/quizListSection/QuizListSection";
import CreateEditQuizSection from "./components/createEditQuizSection/CreateEditQuizSection";
import AssignQuizSection from "./components/assignQuizSection/AssignQuizSection";
import "./TeacherQuiz.css";

export default function TeacherQuiz() {
    return (
        <div className="teacher-quiz">
            <h1>Bài kiểm tra</h1>
            <CreateEditQuizSection />
            <AssignQuizSection />
            <QuizListSection />
        </div>
    );
}

