import React from "react";
import "./RecentActivitiesSection.css";
import { BookOpen } from "lucide-react";

const RecentActivitiesSection = () => {
  const currentWeek = 28;
  const lessons = [
    { title: "Hàm số bậc hai và đồ thị", info: "Tiết 2 • Toán • 10A1", time: "10/04/2026 08:30", status: "published", statusLabel: "Đã đăng" },
    { title: "Đọc hiểu văn bản nghị luận", info: "Tiết 1 • Ngữ văn • 10A1", time: "09/04/2026 14:15", status: "draft", statusLabel: "Nháp" },
    { title: "Phương trình quy về bậc hai", info: "Tiết 4 • Toán • 11B2", time: "08/04/2026 10:00", status: "published", statusLabel: "Đã đăng" },
  ];

  const targetPerWeek = 4;
  const publishedCount = lessons.filter(l => l.status === "published").length;

  return (
    <div className="teacher-dashboard-recent">
      <div className="recent-header">
        <div>
          <p className="teacher-dashboard-title">Học liệu Tuần {currentWeek}</p>
          <span className="recent-subtitle">
            Tuần hiện tại đã đăng <strong>{publishedCount}</strong> bài học
          </span>
        </div>
      </div>

      <div className="recent-list-scroll">
        {lessons.map((lesson, idx) => (
          <div className="recent-item" key={idx}>
            <div className="recent-left">
              <div className="recent-icon">
                <BookOpen size={16} />
              </div>

              <div>
                <p>{lesson.title}</p>
                <div className="recent-details">
                  <span>Tuần {currentWeek} • {lesson.info}</span>
                  <span className="post-date">Đăng lúc: {lesson.time}</span>
                </div>
              </div>
            </div>

            <span className={`status ${lesson.status}`}>{lesson.statusLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivitiesSection;