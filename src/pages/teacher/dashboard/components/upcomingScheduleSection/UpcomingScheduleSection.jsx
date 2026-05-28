import React from "react";
import { useNavigate } from "react-router-dom";
import "./UpcomingScheduleSection.css";
import { School } from "lucide-react";

const UpcomingScheduleSection = ({ classes: apiClasses }) => {
  const navigate = useNavigate();

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
    : [];

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
        {classes.length > 0 ? (
          classes.map((item, index) => (
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
          ))
        ) : (
          <div className="schedule-empty">
            <p>Không có lớp nào trong học kỳ đã chọn.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingScheduleSection;
