import { useState } from "react";
import "./UpcomingSchedule.css";

export default function UpcomingSchedule({ gradesBySemester }) {
  const [open, setOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // ===== OPEN / CLOSE =====
  const handleOpen = (subject) => {
    setSelectedSubject(subject);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedSubject(null);
  };

  // ===== GET DATA =====
  const getSubjectData = () => {
    if (!selectedSubject) return null;

    const hk1 = gradesBySemester.hk1.find(s => s.subject === selectedSubject);
    const hk2 = gradesBySemester.hk2.find(s => s.subject === selectedSubject);
    const year = gradesBySemester.year.find(s => s.subject === selectedSubject);

    return { hk1, hk2, year };
  };

  const data = getSubjectData();

  // ===== RANK =====
  const getRank = (score) => {
    if (score >= 8.5) return { label: "Tốt", class: "green" };
    if (score >= 6.5) return { label: "Khá", class: "blue" };
    return { label: "Trung bình", class: "gray" };
  };

  return (
    <div className="subject-wrapper">

      {/* ===== TITLE ===== */}
      <div className="subject-title">
        Điểm theo môn học
      </div>

      {/* ===== GRID (GIỮ NGUYÊN UI CỦA BẠN) ===== */}
      <div className="subject-grid">
        {gradesBySemester?.year?.map((subject, i) => {

          const hk1 = gradesBySemester.hk1.find(
            s => s.subject === subject.subject
          );

          const hk2 = gradesBySemester.hk2.find(
            s => s.subject === subject.subject
          );

          const avg = subject.average;
          const rank = getRank(avg);

          return (
            <div
              className="subject-card"
              key={i}
              onClick={() => handleOpen(subject.subject)}
            >
              <div className="subject-left">
                <h4>{subject.subject}</h4>
                <p>
                  HK1: {hk1?.average ?? "-"} • HK2: {hk2?.average ?? "-"}
                </p>
              </div>

              <div className="subject-right">
                <div className="score">{avg}</div>

                <span className={`badge ${rank.class}`}>
                  {rank.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== DIALOG ===== */}
      {open && data && (
        <div className="dialog-overlay" onClick={handleClose}>

          <div
            className="dialog-box"
            onClick={(e) => e.stopPropagation()} // ❗ fix click ngoài mới đóng
          >

            {/* HEADER */}
            <div className="dialog-header">
              <h3>Điểm môn {selectedSubject}</h3>

              {/* ❗ FIX NÚT X */}
              <button
                className="dialog-close"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
              >
                ✕
              </button>
            </div>

            {/* CONTENT */}
            <div className="dialog-content">

              <table className="score-table">
                <thead>
                  <tr>
                    <th>Học kỳ</th>
                    <th>Miệng</th>
                    <th>15p</th>
                    <th>Giữa kỳ</th>
                    <th>Cuối kỳ</th>
                    <th>TB</th>
                    <th className="center">Xếp loại</th>
                  </tr>
                </thead>

                <tbody>

                  {/* HK1 + HK2 */}
                  {[data.hk1, data.hk2].map((item, index) => {
                    const safeAvg = parseFloat(item?.average) || 0;
                    const rank = getRank(safeAvg);

                    return (
                      <tr key={index}>
                        <td>{index === 0 ? "HK1" : "HK2"}</td>
                        <td>{item?.oral ?? "-"}</td>
                        <td>{item?.test15 ?? "-"}</td>
                        <td>{item?.midterm ?? "-"}</td>
                        <td>{item?.final ?? "-"}</td>
                        <td>{item?.average ?? "-"}</td>

                        {/* ✅ CENTER */}
                        <td className="center">
                          <span className={`badge ${rank.class}`}>
                            {rank.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {/* CẢ NĂM */}
                  <tr className="total-row">
                    <td>Cả năm</td>
                    <td colSpan="4">—</td>
                    <td>{data.year?.average ?? "-"}</td>

                    <td className="center">
                      <span className={`badge ${getRank(data.year?.average || 0).class}`}>
                        {getRank(data.year?.average || 0).label}
                      </span>
                    </td>
                  </tr>

                </tbody>
              </table>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}