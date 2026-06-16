import React from "react";
import "./RecentActivitiesSection.css";
import { BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import teacherService from "../../../../../services/pages/teacher/teacherService";

const formatActivityTime = (value) => {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return date.toLocaleString("vi-VN");
};

const RecentActivitiesSection = ({ activities: propActivities }) => {
  const currentWeek = 28;

  const { data: lessonsResponse, isLoading } = useQuery({
    queryKey: ["teacher-recent-lessons"],
    queryFn: () => teacherService.listLessons({ mock: false }),
    enabled: !propActivities || propActivities.length === 0,
  });

  const hardcodedLessons = [
    { title: "Hàm số bậc hai và đồ thị", info: "Tiết 2 • Toán • 10A1", time: "10/04/2026 08:30", status: "published", statusLabel: "Đã đăng" },
    { title: "Đọc hiểu văn bản nghị luận", info: "Tiết 1 • Ngữ văn • 10A1", time: "09/04/2026 14:15", status: "draft", statusLabel: "Nháp" },
    { title: "Phương trình quy về bậc hai", info: "Tiết 4 • Toán • 11B2", time: "08/04/2026 10:00", status: "published", statusLabel: "Đã đăng" },
  ];

  const lessonsData = (propActivities && propActivities.length > 0) 
    ? propActivities 
    : (lessonsResponse?.success ? lessonsResponse.data : null);

  const lessons = lessonsData && lessonsData.length > 0 
    ? lessonsData.map(l => ({
        title: l.title || l.content || "Hoạt động mới",
        info: l.info || `${l.period || "N/A"} • ${l.subject_name || "Môn học"} • ${l.class_name || "Lớp"}`,
        time: formatActivityTime(l.created_at || l.time || l.date),
        status: l.status === 'published' || l.status === 'Đã xuất bản' || l.status === 'success' ? 'published' : 'draft',
        statusLabel: l.status === 'published' || l.status === 'Đã xuất bản' ? 'Đã đăng' : (l.status === 'draft' || l.status === 'Bản nháp' ? 'Nháp' : 'Xong')
      }))
    : hardcodedLessons;

  const publishedCount = lessons.filter(l => l.status === "published").length;

  return (
    <div className="teacher-dashboard-recent">
      <div className="recent-header">
        <div>
          <p className="teacher-dashboard-title">Học liệu Tuần {currentWeek}</p>
          <span className="recent-subtitle">
            {isLoading ? "Đang tải dữ liệu..." : (
              <>Tuần hiện tại đã đăng <strong>{publishedCount}</strong> bài học</>
            )}
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
                  <span className="post-date">Thời gian: {lesson.time}</span>
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
