import "./AdminDashboard.css";
import StatisticsCardsSection from "./components/statisticsCardsSection/statisticsCardsSection";
import RecentActivitiesSection from "./components/recentActivitiesSection/recentActivitiesSection";
import SystemAlertsSection from "./components/systemAlertsSection/systemAlertsSection";

const AdminDashboard = () => {
  const classLabels = ["10A1","10A2","10A3","8A1","8A2","7A1","6A1"];
  const classScores = [8.2, 7.5, 7.8, 8.9, 8.1, 7.2, 6.8];
  const maxScore = 10;

  return (
    <div className="dashboard">

      <div className="header">
        <h2>Admin Dashboard</h2>
        <p>Tổng quan hệ thống — Năm học 2024-2025</p>
      </div>

      <StatisticsCardsSection />

      {/* ROW 1 */}
      <div className="row">

        {/* LINE CHART */}
        <div className="card big">
          <h3>Doanh thu học phí theo tháng</h3>

          <div className="line-chart">
            <div className="chart-body">

              <div className="y-axis">
                <span>0</span>
                <span>2tr</span>
                <span>4tr</span>
                <span>6tr</span>
              </div>

              <div className="chart-area">
                {[20, 40, 30, 60, 50, 70].map((y, i) => (
                  <span
                    key={i}
                    style={{
                      left: `${i * 16}%`,
                      bottom: `${y}%`
                    }}
                  />
                ))}
              </div>

            </div>

            <div className="x-axis">
              <span>T1</span>
              <span>T2</span>
              <span>T3</span>
              <span>T4</span>
              <span>T5</span>
              <span>T6</span>
            </div>
          </div>
        </div>

        {/* DONUT */}
        <div className="card donut-card">
          <h3>Phân loại học lực</h3>

          <div className="donut-container">

            <div className="donut"></div>

            <div className="legend-grid">
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

        {/* BAR CHART */}
        <div className="card big">
          <h3>Điểm trung bình theo lớp</h3>

          <div className="class-chart">

            {/* Y AXIS */}
            <div className="y-axis">
              <span>10</span>
              <span>8</span>
              <span>6</span>
              <span>4</span>
              <span>2</span>
              <span>0</span>
            </div>

            {/* BAR AREA */}
            <div className="bar-area">

              {classScores.map((score, i) => (
                <div key={i} className="bar-column">

                  <div
                    className="bar-item"
                    style={{
                      height: `${(score / maxScore) * 100}%`
                    }}
                  >
                    <span className="bar-value">{score}</span>
                  </div>

                  <span className="x-label">
                    {classLabels[i]}
                  </span>

                </div>
              ))}

            </div>

          </div>
        </div>

        <RecentActivitiesSection />
      </div>

      <SystemAlertsSection />

    </div>
  );
};

export default AdminDashboard;