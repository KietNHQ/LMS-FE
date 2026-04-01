import React from "react";
import "./UpcomingScheduleSection.css";
import { School } from "lucide-react";

const UpcomingScheduleSection = () => {
  return (
    <div className="teacher-dashboard-schedule">
      <p className="teacher-dashboard-title">
        Lớp đang phụ trách
      </p>

      <div className="schedule-item">
        <div className="schedule-left">
          <div className="schedule-icon">
            <School size={16} />
          </div>
          <div>
            <p>10A1</p>
            <span>35 học sinh • GVCN</span>
          </div>
        </div>
        <span>Khối 10</span>
      </div>

      <div className="schedule-item">
        <div className="schedule-left">
          <div className="schedule-icon">
            <School size={16} />
          </div>
          <div>
            <p>11B2</p>
            <span>34 học sinh • GVCN</span>
          </div>
        </div>
        <span>Khối 11</span>
      </div>

      <div className="schedule-item">
        <div className="schedule-left">
          <div className="schedule-icon">
            <School size={16} />
          </div>
          <div>
            <p>9A1</p>
            <span>30 học sinh • GVCN</span>
          </div>
        </div>
        <span>Khối 9</span>
      </div>
    </div>
  );
};

export default UpcomingScheduleSection;