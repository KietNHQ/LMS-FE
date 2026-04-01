import React from "react";
import "./RecentActivitiesSection.css";
import { BookOpen } from "lucide-react";

const RecentActivitiesSection = () => {
  return (
    <div className="teacher-dashboard-recent">
      <p className="teacher-dashboard-title">
        Bài học gần đây
      </p>

      {/* Item 1 */}
      <div className="recent-item">
        <div className="recent-left">
          <div className="recent-icon">
            <BookOpen size={16} />
          </div>

          <div>
            <p>Hàm số bậc hai và đồ thị</p>
            <span>Toán • 10A1</span>
          </div>
        </div>

        <span className="status published">Đã đăng</span>
      </div>

      {/* Item 2 */}
      <div className="recent-item">
        <div className="recent-left">
          <div className="recent-icon">
            <BookOpen size={16} />
          </div>

          <div>
            <p>Đọc hiểu văn bản nghị luận</p>
            <span>Ngữ văn • 10A1</span>
          </div>
        </div>

        <span className="status draft">Nháp</span>
      </div>
    </div>
  );
};

export default RecentActivitiesSection;