import React from "react";
import "./OverviewCardsSection.css";
import { School,Users, BookOpen, ClipboardList } from "lucide-react";

const OverviewCardsSection = () => {
  const cards = [
    {
      title: "Lớp đang dạy",
      value: 3,
      icon: <School />,
      color: "#10b981",
      bg: "#d1fae5",
    },
    {
      title: "Lớp chủ nhiệm kỳ này",
      value: 3,
      icon: <Users />,
      color: "#3b82f6",
      bg: "#dbeafe",
    },
    {
      title: "Điểm chuyên cần tuần này",
      value: "95%",
      icon: <BookOpen />,
      color: "#8b5cf6",
      bg: "#ede9fe",
    },
  ];

  return (
    <div className="teacher-dashboard-cards">
      {cards.map((item, index) => (
        <div key={index} className="teacher-dashboard-card">
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