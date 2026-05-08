import React from "react";
import { Button } from "../../../../../components/ui";
import {
    BiTimeFive,
    BiCalendar,
    BiUser,
    BiPlayCircle,
    BiCheckCircle,
    BiAlarm,
    BiBook,
    BiWorld,
    BiLeaf,
} from "react-icons/bi";
import {
    FaSquareRootAlt,
    FaAtom,
    FaFlask,
    FaBookOpen,
    FaLanguage,
    FaMicroscope,
    FaLaptopCode,
    FaGlobeAsia,
    FaDumbbell,
    FaPalette,
    FaMusic,
    FaGraduationCap,
} from "react-icons/fa";
import { FiLock, FiX } from "react-icons/fi";
import "./QuizCard.css";

const subjectIconMap = {
    toán: FaSquareRootAlt,
    "vật lý": FaAtom,
    "hóa học": FaFlask,
    "ngữ văn": FaBookOpen,
    "tiếng anh": FaLanguage,
    "sinh học": FaMicroscope,
    "lịch sử": BiBook,
    "địa lý": FaGlobeAsia,
    "tin học": FaLaptopCode,
    "giáo dục công dân": BiWorld,
    "thể dục": FaDumbbell,
    "mỹ thuật": FaPalette,
    "âm nhạc": FaMusic,
    "công nghệ": BiLeaf,
};

function getSubjectIcon(subjectName) {
    const normalizedName = subjectName.trim().toLowerCase();
    return subjectIconMap[normalizedName] || FaGraduationCap;
}

function getStatusInfo(status) {
    switch (status) {
        case "open":
            return {
                label: "Đang mở",
                className: "open",
                icon: <BiPlayCircle />,
            };
        case "done":
            return {
                label: "Đã hoàn thành",
                className: "done",
                icon: <BiCheckCircle />,
            };
        case "upcoming":
            return {
                label: "Sắp mở",
                className: "upcoming",
                icon: <BiAlarm />,
            };
        case "closed":
            return {
                label: "Đã đóng",
                className: "closed",
                icon: <FiLock />,
            };
        default:
            return {
                label: "Không xác định",
                className: "closed",
                icon: <FiX />,
            };
    }
}

export default function QuizCard({ quiz, onStart }) {
    const statusInfo = getStatusInfo(quiz.status);

    return (
        <div className="quiz-card">
            <div className="quiz-card-top">
                <div className="quiz-card-subject">
                    <span className="quiz-card-subject-icon">{React.createElement(getSubjectIcon(quiz.subject))}</span>
                    <span>{quiz.subject}</span>
                </div>

                <div className="quiz-card-actions-top">
                    <div className={`quiz-card-status ${statusInfo.className}`}>
                        {statusInfo.icon}
                        <span>{statusInfo.label}</span>
                    </div>

                    {quiz.score !== undefined && quiz.status === "done" && (
                        <div className="quiz-card-score">Điểm: {quiz.score}</div>
                    )}
                </div>
            </div>

            <h3>{quiz.title}</h3>
            <p>{quiz.description}</p>

            <div className="quiz-card-meta">
                <div className="quiz-card-meta-item">
                    <BiTimeFive />
                    <span>{quiz.duration} phút</span>
                </div>

                <div className="quiz-card-meta-item">
                    <BiCalendar />
                    <span>{quiz.dueDate}</span>
                </div>

                <div className="quiz-card-meta-item">
                    <BiUser />
                    <span>{quiz.teacher}</span>
                </div>
            </div>

            <div className="quiz-card-footer">
                <div className="quiz-card-footer-left">
                    <span className="quiz-card-type">{quiz.type}</span>
                    <span className="quiz-card-count">{quiz.questionsCount} câu hỏi</span>
                </div>

                {quiz.status === "open" ? (
                    <Button className="quiz-card-btn" variant="primary" onClick={() => onStart(quiz)}>
                        Vào làm bài
                    </Button>
                ) : quiz.status === "done" ? (
                    <Button className="quiz-card-btn ghost" variant="secondary" disabled>
                        Đã nộp
                    </Button>
                ) : quiz.status === "upcoming" ? (
                    <Button className="quiz-card-btn ghost" variant="secondary" disabled>
                        Chưa mở
                    </Button>
                ) : (
                    <Button className="quiz-card-btn ghost closed" variant="secondary" disabled>
                        Đã đóng
                    </Button>
                )}
            </div>

        </div>
    );
}



