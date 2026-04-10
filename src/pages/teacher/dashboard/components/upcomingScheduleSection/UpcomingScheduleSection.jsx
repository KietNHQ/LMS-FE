import React from "react";
import "./UpcomingScheduleSection.css";
import { School } from "lucide-react";

const UpcomingScheduleSection = () => {
  const classes = [
    {
      name: "10A1",
      students: 35,
      role: "GVCN",
      roleLabel: "Lớp Chủ Nhiệm",
      grade: "10",
      type: "homeroom"
    },
    { name: "10A1", type: "LỚP CHỦ NHIỆM", students: 35, role: "GVCN", grade: "Khối 10", isHomeroom: true },
    { name: "11B2", type: "LỚP GIẢNG DẠY", students: 34, role: "GVBM", grade: "Khối 11", isHomeroom: false },
    { name: "12A5", type: "LỚP GIẢNG DẠY", students: 30, role: "GVBM", grade: "Khối 12", isHomeroom: false },
    { name: "10B4", type: "LỚP GIẢNG DẠY", students: 32, role: "GVBM", grade: "Khối 10", isHomeroom: false },
    { name: "11A3", type: "LỚP GIẢNG DẠY", students: 33, role: "GVBM", grade: "Khối 11", isHomeroom: false },
    { name: "12C1", type: "LỚP GIẢNG DẠY", students: 28, role: "GVBM", grade: "Khối 12", isHomeroom: false },
    { name: "10C2", type: "LỚP GIẢNG DẠY", students: 31, role: "GVBM", grade: "Khối 10", isHomeroom: false },
  ];

  return (
    <div className="teacher-dashboard-schedule">
      <p className="teacher-dashboard-title">Lớp đang phụ trách</p>
      
      <div className="schedule-list-scroll">
        {classes.map((item, index) => (
          <div key={index} className="schedule-item">
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