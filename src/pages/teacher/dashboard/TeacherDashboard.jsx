import React from "react";
import "./TeacherDashboard.css";
import { ClipboardList } from "lucide-react";

import OverviewCardsSection from "./components/overviewCardsSection/OverviewCardsSection";
import RecentActivitiesSection from "./components/recentActivitiesSection/RecentActivitiesSection";
import UpcomingScheduleSection from "./components/upcomingScheduleSection/UpcomingScheduleSection";

const TeacherDashboard = () => {

  // ===== DATA =====
  const classLabels = ["10A1", "11A3", "12A5"];
  const classScores = [7.0, 4.0, 6.5];

  // ===== SCALE ĐỘNG =====
  const maxScore = Math.max(...classScores);
  const chartHeight = 150;

  return (
    <div className="teacher-dashboard-container">
      {/* Header */}
      <div className="teacher-dashboard-header">
        <h2>Xin chào, Hương! 👋</h2>
        <p>Năm học 2024-2025 — HK2</p>
      </div>

      {/* Cards */}
      <OverviewCardsSection />

      {/* Middle */}
      <div className="teacher-dashboard-middle">
        {/* Chart */}
        <div className="teacher-dashboard-chart">
  <p className="teacher-dashboard-title">
    Điểm trung bình theo lớp
  </p>

  <div className="teacher-chart-wrapper">

    {/* ===== Y AXIS LABELS ===== */}
    <div className="teacher-y-axis-labels">
      {[0, 2, 4, 6, 8, 10].map((value) => (
        <div key={value} className="teacher-y-axis-label">
          <span>{value}</span>
          <div className="teacher-y-tick"></div>
        </div>
      ))}
    </div>

    {/* ===== Y AXIS ===== */}
    <div className="teacher-y-axis"></div>

    {/* ===== DATA ===== */}
    <div className="teacher-chart-box">
      {classScores.map((score, index) => {
        const height = (score / maxScore) * chartHeight;

        return (
          <div className="teacher-chart-column" key={index}>
            <div
              className="teacher-bar"
              style={{ height: `${height}px` }}
            ></div>

            <span className="teacher-chart-label">
              {classLabels[index]}
            </span>
          </div>
        );
      })}
    </div>

    {/* ===== X AXIS ===== */}
    <div className="teacher-x-axis"></div>

    {/* ===== X TICKS ===== */}
    <div className="teacher-x-axis-ticks">
      {classLabels.map((_, index) => (
        <div key={index} className="teacher-x-tick"></div>
      ))}
    </div>

  </div>
</div>

        <UpcomingScheduleSection />
      </div>

      {/* Bottom */}
      <div className="teacher-dashboard-bottom">
        <RecentActivitiesSection />

        {/* Quiz */}
        <div className="teacher-dashboard-quiz">
          <p className="teacher-dashboard-title">
            Quiz đang hoạt động
          </p>

          {/* Item 1 */}
          <div className="teacher-dashboard-quiz-item">
            <div className="quiz-left">
              <div className="quiz-icon">
                <ClipboardList size={16} />
              </div>
              <div>
                <p>Kiểm tra Toán chương 1</p>
                <span>10A1 • 45 phút • 20 câu</span>
              </div>
            </div>
            <span className="status active">Đang mở</span>
          </div>

          {/* Item 2 */}
          <div className="teacher-dashboard-quiz-item">
            <div className="quiz-left">
              <div className="quiz-icon">
                <ClipboardList size={16} />
              </div>
              <div>
                <p>Kiểm tra Toán chương 2</p>
                <span>10A2 • 45 phút • 20 câu</span>
              </div>
            </div>
            <span className="status closed">Đã đóng</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;