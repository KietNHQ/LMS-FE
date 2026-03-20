import "./AdminDashboard.css";
import StatisticsCardsSection from "./components/statisticsCardsSection/statisticsCardsSection";
import RecentActivitiesSection from "./components/recentActivitiesSection/recentActivitiesSection";
import SystemAlertsSection from "./components/systemAlertsSection/systemAlertsSection";

const AdminDashboard = () => {
  return (
    <div className="dashboard">

      <div className="header">
        <h2>Admin Dashboard</h2>
        <p>Tổng quan hệ thống — Năm học 2024-2025</p>
      </div>

      <StatisticsCardsSection />

      {/* ROW 1 */}
      <div className="row">
        <div className="card big">
          <h3>Doanh thu học phí theo tháng</h3>
          <div className="line-chart"></div>
        </div>

        <div className="card">
          <h3>Phân loại học lực</h3>

          <div className="donut-wrap">
            <div className="donut"></div>

            <div className="legend">
              <div><span className="dot blue"></span> Khá: 42%</div>
              <div><span className="dot green"></span> Tốt: 38%</div>
              <div><span className="dot yellow"></span> Đạt: 15%</div>
              <div><span className="dot red"></span> Chưa đạt: 5%</div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2 */}
      <div className="row">
        <div className="card big">
          <h3>Điểm trung bình theo lớp</h3>

          <div className="bar">
            {[80,60,65,75,90,78,70].map((h,i)=>(
              <div key={i} style={{height:`${h}%`}}></div>
            ))}
          </div>
        </div>

        <RecentActivitiesSection />
      </div>

      <SystemAlertsSection />

    </div>
  );
};

export default AdminDashboard;