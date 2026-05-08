import "./statisticsCardsSection.css";
import { GraduationCap, Users, School } from "lucide-react";

const StatisticsCardsSection = ({ totalStudents, totalTeachers, totalClasses, selectedSchoolYear }) => {
  const data = [
    {
      title: "Tổng học sinh",
      value: totalStudents,
      sub: "Tất cả khối lớp",
      icon: <GraduationCap />,
      color: "blue",
    },
    {
      title: "Giáo viên",
      value: totalTeachers,
      sub: "Đang giảng dạy",
      icon: <Users />,
      color: "green",
    },
    {
      title: "Lớp học",
      value: totalClasses,
      sub: `Năm học ${selectedSchoolYear}`,
      icon: <School />,
      color: "purple",
    },
  ];

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
