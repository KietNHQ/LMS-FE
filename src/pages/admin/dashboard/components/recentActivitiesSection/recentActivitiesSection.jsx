import "./recentActivitiesSection.css";

const data = [
  "Nguyễn Minh Tuấn",
  "Trần Thị Bảo Châu",
  "Lê Hoàng Nam",
  "Phạm Ngọc Ánh",
  "Vũ Thị Mai",
];

const RecentActivitiesSection = () => {
  return (
    <div className="card">
      <h3>Học sinh mới nhất</h3>

      {data.map((n,i)=>(
        <div className="row-item" key={i}>
          <span className="avatar">{n[0]}</span>
          <span>{n}</span>
          <span className="status">Đang học</span>
        </div>
      ))}
    </div>
  );
};

export default RecentActivitiesSection;