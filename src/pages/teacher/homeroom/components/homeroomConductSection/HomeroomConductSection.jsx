import React from "react";
import "./HomeroomConductSection.css";

const LEVEL_KEY = { "Tốt": "tot", "Khá": "kha", "Đạt": "dat", "Chưa đạt": "chua-dat" };
const LEVEL_LABELS = { tot: "Tốt", kha: "Khá", dat: "Đạt", "chua-dat": "Chưa đạt" };

function pillClass(level) {
  if (!level) return "conduct-pill empty";
  return `conduct-pill ${LEVEL_KEY[level] || "empty"}`;
}

export default function HomeroomConductSection({ classId, selectedSchoolYear, hkSemesterIds, conductData, isLoading }) {
  if (isLoading) {
    return (
      <div className="homeroom-conduct-section">
        <div className="homeroom-conduct-loading">
          <div className="spinner" />
          Đang tải dữ liệu hạnh kiểm...
        </div>
      </div>
    );
  }

  if (!conductData) {
    return (
      <div className="homeroom-conduct-section">
        <div className="homeroom-conduct-loading">
          Không có dữ liệu hạnh kiểm cho lớp này.
        </div>
      </div>
    );
  }

  const { stats, students } = conductData;

  return (
    <div className="homeroom-conduct-section">
      <div className="conduct-section-title">
        Tổng kết Hạnh kiểm — {selectedSchoolYear}
      </div>

      {stats && (
        <div className="homeroom-stats-grid">
          <div className="homeroom-stat-card">
            <div className="stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="stat-info">
              <h3>Tổng số HS</h3>
              <p>{stats.total ?? "—"} học sinh</p>
            </div>
          </div>

          <div className="homeroom-stat-card">
            <div className="stat-icon" style={{ background: "#f0fdf4", color: "#16a34a" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="stat-info">
              <h3>Tốt HK I</h3>
              <p>{stats.hk1Levels?.["Tốt"] ?? 0} học sinh</p>
            </div>
          </div>

          <div className="homeroom-stat-card">
            <div className="stat-icon" style={{ background: "#f0fdf4", color: "#16a34a" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="stat-info">
              <h3>Tốt HK II</h3>
              <p>{stats.hk2Levels?.["Tốt"] ?? 0} học sinh</p>
            </div>
          </div>

          <div className="homeroom-stat-card">
            <div className="stat-icon" style={{ background: "#f0fdf4", color: "#16a34a" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div className="stat-info">
              <h3>Tốt Cả năm</h3>
              <p>{stats.annualLevels?.["Tốt"] ?? 0} học sinh</p>
            </div>
          </div>
        </div>
      )}

      <div className="homeroom-conduct-table-wrap">
        <table className="homeroom-conduct-table">
          <thead>
            <tr>
              <th>Học sinh</th>
              <th className="th-center">HK I</th>
              <th className="th-center">HK II</th>
              <th className="th-center">Cả năm</th>
            </tr>
          </thead>
          <tbody>
            {(students || []).map((s) => (
              <tr key={s.enrollmentId}>
                <td>
                  <div className="conduct-student-cell">
                    <strong>{s.studentName || "—"}</strong>
                    <small>{s.studentCode}</small>
                  </div>
                </td>
                <td className="td-center">
                  <span className={pillClass(s.hk1Level)}>{s.hk1Level || "Chưa có"}</span>
                </td>
                <td className="td-center">
                  <span className={pillClass(s.hk2Level)}>{s.hk2Level || "Chưa có"}</span>
                </td>
                <td className="td-center">
                  <span className={pillClass(s.annualLevel)}>{s.annualLevel || "Chưa có"}</span>
                </td>
              </tr>
            ))}
            {(!students || students.length === 0) && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "#9ca3af" }}>
                  Chưa có dữ liệu hạnh kiểm cho lớp này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
