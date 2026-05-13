import React from "react";
import { useNavigate } from "react-router-dom";
import "./OverviewCardsSection.css";
import { School, Users, BookOpen } from "lucide-react";

const OverviewCardsSection = ({ stats }) => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Lớp đang dạy",
      value: stats?.totalTeachingClasses ?? 3,
      icon: <School />,
      color: "#10b981",
      bg: "#d1fae5",
      path: "/teacher/teaching-classes",
    },
    {
      title: "Lớp chủ nhiệm kỳ này",
      value: stats?.homeroomClassName || stats?.totalHomeroomClasses || "---",
      icon: <Users />,
      color: "#3b82f6",
      bg: "#dbeafe",
      path: "/teacher/homeroom",
    },
    {
      title: "Điểm nề nếp & chuyên cần",
      value: stats?.attendanceScore ?? "9.5/10",
      icon: <BookOpen />,
      color: "#8b5cf6",
      bg: "#ede9fe",
      path: "/teacher/homeroom?tab=attendance",
    },
  ];

  const handleCardClick = (path) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className="teacher-dashboard-cards">
      {cards.map((item, index) => (
        <div 
          key={index} 
          className={`teacher-dashboard-card ${item.path ? "clickable" : ""}`}
          onClick={() => handleCardClick(item.path)}
        >
          <div>
            <p>{item.title}</p>
            <h3>{item.value}</h3>
          </div>

          <div
            className="teacher-dashboard-card-icon"
            style={{ background: item.bg }}
          >
            {React.cloneElement(item.icon, {
              size: 20,
              color: item.color,
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverviewCardsSection;
