import React from "react";
import { BiBookContent, BiPlayCircle, BiCheckCircle } from "react-icons/bi";
import "./QuizHeader.css";

export default function QuizHeader({ stats }) {
    return (
        <div className="quiz-header-wrap">
            <div className="quiz-header">
                <h1>Bài kiểm tra</h1>
            </div>

            <div className="quiz-header-stats">
                <div className="quiz-stat-card">
                    <div className="quiz-stat-icon total">
                        <BiBookContent />
                    </div>
                    <div>
                        <span>Tổng bài kiểm tra</span>
                        <strong>{stats.total}</strong>
                    </div>
                </div>

                <div className="quiz-stat-card">
                    <div className="quiz-stat-icon open">
                        <BiPlayCircle />
                    </div>
                    <div>
                        <span>Bài đang mở</span>
                        <strong>{stats.open}</strong>
                    </div>
                </div>

                <div className="quiz-stat-card">
                    <div className="quiz-stat-icon done">
                        <BiCheckCircle />
                    </div>
                    <div>
                        <span>Đã làm xong</span>
                        <strong>{stats.done}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}