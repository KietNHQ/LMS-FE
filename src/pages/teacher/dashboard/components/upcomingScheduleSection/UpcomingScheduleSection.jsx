import React from "react";
import { useNavigate } from "react-router-dom";
import "./UpcomingScheduleSection.css";
import { School } from "lucide-react";

const UpcomingScheduleSection = ({ classes: apiClasses }) => {
  const navigate = useNavigate();

  const hardcodedClasses = [
    { id: 1, name: "10A1", type: "LỚP CHỦ NHIỆM", students: 35, role: "GVCN", grade: "Khối 10", isHomeroom: true },
    { id: 2, name: "11B2", type: "LỚP GIẢNG DẠY", students: 34, role: "GVBM", grade: "Khối 11", isHomeroom: false },
    { id: 3, name: "12A5", type: "LỚP GIẢNG DẠY", students: 30, role: "GVBM", grade: "Khối 12", isHomeroom: false },
    { id: 4, name: "10B4", type: "LỚP GIẢNG DẠY", students: 32, role: "GVBM", grade: "Khối 10", isHomeroom: false },
    { id: 5, name: "11A3", type: "LỚP GIẢNG DẠY", students: 33, role: "GVBM", grade: "Khối 11", isHomeroom: false },
    { id: 6, name: "12C1", type: "LỚP GIẢNG DẠY", students: 28, role: "GVBM", grade: "Khối 12", isHomeroom: false },
    { id: 7, name: "10C2", type: "LỚP GIẢNG DẠY", students: 31, role: "GVBM", grade: "Khối 10", isHomeroom: false },
  ];

  // Nếu có data từ API thì ưu tiên dùng, nếu không thì dùng mock
  const classes = apiClasses && apiClasses.length > 0 
    ? apiClasses.map(c => ({
        id: c.id,
        name: c.class_name || c.name,
        students: c.actual_students || c.max_students || 0,
        role: c.role || (c.isHomeroom ? "GVCN" : "GVBM"),
        type: c.role === "GVCN" || c.isHomeroom ? "LỚP CHỦ NHIỆM" : "LỚP GIẢNG DẠY",
        isHomeroom: c.isHomeroom ?? !!c.homeroom_teacher_id,
        grade: c.grade_level || "10"
      }))
    : hardcodedClasses;

  const handleClassClick = (item) => {
    if (item.isHomeroom) {
      navigate("/teacher/homeroom");
    } else {
      navigate(`/teacher/teaching-classes/${item.id}`);
    }
  };

  return (
    <div className="teacher-dashboard-schedule">
      <p className="teacher-dashboard-title">Lớp đang phụ trách</p>
      
      <div className="schedule-list-scroll">
        {classes.map((item, index) => (
          <div 
            key={index} 
            className="schedule-item clickable"
            onClick={() => handleClassClick(item)}
          >
            <div className="schedule-left">
              <div className={`schedule-icon ${item.isHomeroom ? "homeroom" : "teaching"}`}>
                <School size={16} />
              </div>
              
              <div className="schedule-info">
                <div className="class-header">
                  <span className="class-name">{item.name}</span>
                </div>
                <div className="class-meta">
                  <span>{item.students} học sinh • {item.role}</span>
                </div>
              </div>
            </div>
            
            <div className={`status-tag ${item.isHomeroom ? "homeroom" : "teaching"}`}>
              {item.type}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingScheduleSection;
