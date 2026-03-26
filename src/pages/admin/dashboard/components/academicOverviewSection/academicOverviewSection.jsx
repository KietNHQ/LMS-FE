import "./academicOverviewSection.css";

const AcademicOverviewSection = () => {
  return (
    <div className="admin-dashboard__card admin-dashboard__card--donut admin-dashboard__academic-overview-section">
      <h3>Tổng quan học lực</h3>

      <div className="admin-dashboard__donut-container">
        <div className="admin-dashboard__donut"></div>
        <div className="admin-dashboard__legend-grid">
          <div><span className="admin-dashboard__dot admin-dashboard__dot--blue"></span> Giỏi: 42%</div>
          <div><span className="admin-dashboard__dot admin-dashboard__dot--green"></span> Khá: 38%</div>
          <div><span className="admin-dashboard__dot admin-dashboard__dot--yellow"></span> Trung bình: 15%</div>
          <div><span className="admin-dashboard__dot admin-dashboard__dot--red"></span> Yếu: 5%</div>
        </div>
      </div>
    </div>
  );
};

export default AcademicOverviewSection;
