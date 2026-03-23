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
    <div className="card-student">
      <h3>Học sinh mới nhất</h3>

      {data.map((n,i)=>(
        <div className="row-item" key={i}>
        <span className="avatar">{n[0]}</span>

        <div className="info">
            <div className="name">{n}</div>
            <div className="sub">10A1 • Trần Thị Hương</div>
        </div>

        <span className="status">Đang học</span>
        </div>
      ))}
    </div>
    </div>
  );
};

export default RecentActivitiesSection; 