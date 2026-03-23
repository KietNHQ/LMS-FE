import "./statisticsCardsSection.css";
import { GraduationCap, Users, School, DollarSign } from "lucide-react";

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
  {
    title: "Học phí thu",
    value: "14tr đ",
    sub: "4 hóa đơn chưa thanh toán",
    icon: <DollarSign />,
    color: "orange",
  },
];

const StatisticsCardsSection = () => {
  return (
    <div className="stats">
      {data.map((item, i) => (
        <div key={i} className="card-stat">

          {/* LEFT */}
          <div className="stat-left">
            <p className="stat-title">{item.title}</p>

            <div className="stat-value-row">
              <h3>{item.value}</h3>
            </div>

            <span className="stat-sub">{item.sub}</span>
          </div>

          {/* RIGHT ICON */}
          <div className={`icon ${item.color}`}>
            {item.icon}
          </div>

        </div>
      ))}
    </div>
  );
};

export default StatisticsCardsSection;