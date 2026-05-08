import React from "react";
import { FiClock } from "react-icons/fi";
import "./CreateEditQuizSection.css";

export default function CreateEditQuizSection({ activeQuiz }) {
    if (!activeQuiz) return null;

    return (
        <section className="quiz-overview-card">
            <div className="quiz-overview-left">
                <h2>{activeQuiz.title}</h2>
                <p>
                    {activeQuiz.subject} • {activeQuiz.className}
                </p>
            </div>

            <div className="quiz-overview-right">
                <span className="quiz-overview-meta">
                    <FiClock className="quiz-overview-meta-icon" aria-hidden="true" />
                    <span>{activeQuiz.duration}</span>
                </span>
                <span>{activeQuiz.questions.length} câu hỏi</span>
            </div>
        </section>
    );
}
