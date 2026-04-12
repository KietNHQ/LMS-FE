import React, { useState } from "react";
import "./QuizManagementSection.css";
import { ClipboardList } from "lucide-react";
import WeekPicker from "../../../../../../../../components/common/WeekPicker/WeekPicker";

const QuizManagementSection = () => {
  const [selectedWeek, setSelectedWeek] = useState(28);

  const quizzes = [
    {
      id: 1,
      title: "Kiểm tra Toán chương 1",
      class: "10A1",
      duration: "15 phút",
      type: "15 phút",
      week: 28,
      status: "active",
      statusText: "Đang mở",
    },
    {
      id: 2,
      title: "Kiểm tra Toán chương 2",
      class: "10A2",
      duration: "45 phút",
      type: "1 tiết",
      week: 28,
      status: "closed",
      statusText: "Đã đóng",
    },
    {
      id: 3,
      title: "Kiểm tra 15p Tiếng Anh",
      class: "11B2",
      duration: "15 phút",
      type: "15 phút",
      week: 28,
      status: "pending",
      statusText: "Chờ chấm",
    },
    {
      id: 4,
      title: "Ôn tập giữa kỳ",
      class: "12A5",
      duration: "45 phút",
      type: "1 tiết",
      week: 27,
      status: "closed",
      statusText: "Đã đóng",
    },
  ];

  const filteredQuizzes = quizzes.filter((q) => q.week === selectedWeek);

  return (
    <div className="teacher-dashboard-quiz">
      <div className="quiz-management-header">
        <p className="teacher-dashboard-title">Quản lý bài kiểm tra</p>
        <WeekPicker 
          value={selectedWeek} 
          onChange={setSelectedWeek} 
          label="" 
        />
      </div>

      <div className="quiz-list-scroll">
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz) => (
            <div className="teacher-dashboard-quiz-item" key={quiz.id}>
              <div className="quiz-left">
                <div className="quiz-icon">
                  <ClipboardList size={16} />
                </div>
                <div>
                  <p>{quiz.title}</p>
                  <span>
                    {quiz.class} • {quiz.type} • {quiz.duration}
                  </span>
                </div>
              </div>
              <span className={`status ${quiz.status}`}>
                {quiz.statusText}
              </span>
            </div>
          ))
        ) : (
          <div className="quiz-empty">
            <p>Không có bài kiểm tra nào trong tuần này.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizManagementSection;



