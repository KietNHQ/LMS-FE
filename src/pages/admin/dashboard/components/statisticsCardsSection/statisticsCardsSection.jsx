import "./statisticsCardsSection.css";
import { GraduationCap, Users, School } from "lucide-react";

const data = [
  {
    title: "Tổng học sinh",
    value: "8",
    sub: "Tất cả khối lớp",
    icon: <GraduationCap />,
    color: "blue",
  },
  {
    title: "Giáo viên",
    value: "4",
    sub: "Đang giảng dạy",
    icon: <Users />,
    color: "green",
  },
  {
    title: "Lớp học",
    value: "7",
    sub: "Năm học 2024-2025",
    icon: <School />,
    color: "purple",
  },
];

const StatisticsCardsSection = () => {
  return (
    <div className="admin-dashboard__stats">
      {data.map((item, i) => (
        <div key={i} className="admin-dashboard__stat-card">

          {/* LEFT */}
          <div className="admin-dashboard__stat-left">
            <p className="admin-dashboard__stat-title">{item.title}</p>

            <div className="admin-dashboard__stat-value-row">
              <h3>{item.value}</h3>
            </div>

            <span className="admin-dashboard__stat-sub">{item.sub}</span>
          </div>

          {/* RIGHT ICON */}
          <div className={`admin-dashboard__icon admin-dashboard__icon--${item.color}`}>
            {item.icon}
          </div>

        </div>
      ))}
    </div>
  );
};

export default StatisticsCardsSection;