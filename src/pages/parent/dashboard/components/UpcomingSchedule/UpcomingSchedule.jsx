import { useState } from "react";
import "./UpcomingSchedule.css";
import GradesSection from "../../../children-overview/components/GradesSection/GradesSection";

export default function UpcomingSchedule({ gradesBySemester }) {

  const [open, setOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [semester, setSemester] = useState("hk1");

  // mở dialog
  const handleOpen = (subject) => {
    setSelectedSubject(subject);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // lọc dữ liệu theo môn
  const filterGrades = (semesterKey) => {
    return gradesBySemester?.[semesterKey]?.filter(
      g => g.subject === selectedSubject
    ) || [];
  };

  const filteredGradesBySemester = {
    hk1: filterGrades("hk1"),
    hk2: filterGrades("hk2"),
    year: filterGrades("year")
  };

  // lấy label + class
  const getRankClass = (score) => {
    if (score >= 8.5) return "good";
    return "normal";
  };

  const getRankLabel = (score) => {
    if (score >= 8.5) return "Tốt";
    if (score >= 6.5) return "Khá";
    return "Trung bình";
  };

  return (

    <div className="subject-wrapper">

      <div className="subject-title">
        📚 Điểm theo môn học
      </div>

      {/* 🔥 GRID HIỂN THỊ ĐÚNG UI */}
      <div className="subject-grid">

        {gradesBySemester?.year?.map((subject, i) => {

          const hk1 = gradesBySemester.hk1.find(
            s => s.subject === subject.subject
          );

          const hk2 = gradesBySemester.hk2.find(
            s => s.subject === subject.subject
          );

          const avg = subject.average;

          return (
            <div
              className="subject-card"
              key={i}
              onClick={() => handleOpen(subject.subject)}
            >

              {/* LEFT */}
              <div className="subject-left">
                <h4>{subject.subject}</h4>

                <p>
                  HK1: {hk1?.average ?? "-"} • HK2: {hk2?.average ?? "-"}
                </p>
              </div>

              {/* RIGHT */}
              <div className="subject-right">
                <div className="score">{avg}</div>

                <span className={`badge ${getRankClass(avg)}`}>
                  {getRankLabel(avg)}
                </span>
              </div>

            </div>
          );
        })}

      </div>

      {/* 🔥 DIALOG CHI TIẾT */}
      {open && (

        <div className="dialog-overlay">

          <div className="dialog-box">

            <button
              className="dialog-close"
              onClick={handleClose}
            >
              ✕
            </button>

            <h3>Điểm môn {selectedSubject}</h3>

            <GradesSection
              gradesBySemester={filteredGradesBySemester}
              selectedSemester={semester}
              onSemesterChange={setSemester}
              compact
            />

          </div>

        </div>

      )}

    </div>

  );
}