import "./AdminDashboard.css";
import StatisticsCardsSection from "./components/statisticsCardsSection/statisticsCardsSection";
import RecentActivitiesSection from "./components/recentActivitiesSection/recentActivitiesSection";
import SystemAlertsSection from "./components/systemAlertsSection/systemAlertsSection";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

const AdminDashboard = () => {

  // ===== DATA BAR CHART =====
  const classLabels = ["10A1","10A2","10A3","8A1","8A2","7A1","6A1"];
  const classScores = [8.2, 7.5, 7.8, 8.9, 8.1, 7.2, 6.8];

  // ===== DATA LINE CHART =====
  const revenueData = [
    { month: "T1", value: 20 },
    { month: "T2", value: 40 },
    { month: "T3", value: 30 },
    { month: "T4", value: 60 },
    { month: "T5", value: 50 },
    { month: "T6", value: 70 },
  ];

  return (
    <div className="dashboard">

      <div className="header">
        <h2>Admin Dashboard</h2>
        <p>Tổng quan hệ thống — Năm học 2024-2025</p>
      </div>

      <StatisticsCardsSection />

      {/* ROW 1 */}
      <div className="row">

        {/* ===== LINE CHART ===== */}
        <div className="card big">
          <h3>Doanh thu học phí theo tháng</h3>

          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DONUT (GIỮ NGUYÊN) */}
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

        {/* ===== BAR CHART ===== */}
        <div className="card big">
          <h3>Điểm trung bình theo lớp</h3>

          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart
                data={classLabels.map((label, i) => ({
                  class: label,
                  score: classScores[i]
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="class" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar
                  dataKey="score"
                  fill="#60a5fa"
                  radius={[6, 6, 0, 0]}
                  barSize={30} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <RecentActivitiesSection />
      </div>

      <SystemAlertsSection />

    </div>
  );
};

export default AdminDashboard;