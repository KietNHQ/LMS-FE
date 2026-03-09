import React from "react";
import "./QuizList.css";

export default function QuizList({ items = [] }) {
    const defaultItems = [
        { title: "Grammar Quiz", meta: "Due tomorrow" },
        { title: "Vocabulary Test", meta: "Class 10A1" },
        { title: "Reading Practice", meta: "Friday, 10:00 AM" },
    ];

    const quizzes = items.length ? items : defaultItems;

    return (
        <div className="quiz-list">
            {quizzes.map((quiz, index) => (
                <div className="quiz-item" key={index}>
                    <div className="quiz-item-left">
                        <h5>{quiz.title}</h5>
                        <p>{quiz.meta}</p>
                    </div>
                    <button className="quiz-view-btn">View</button>
                </div>
            ))}
        </div>
    );
}