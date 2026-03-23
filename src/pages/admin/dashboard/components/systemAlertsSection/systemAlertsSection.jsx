import "./systemAlertsSection.css";
import { AlertTriangle, BookOpen, GraduationCap } from "lucide-react";

const SystemAlertsSection = () => {
  return (
    <div className="alerts">
      <div className="alert warn">
        <AlertTriangle size={18}/>
        <div>
          <p>4 hóa đơn</p>
          <span>Chưa thanh toán</span>
        </div>
      </div>

      <div className="alert blue">
        <BookOpen size={18}/>
        <div>
          <p>3 quiz mới</p>
          <span>Đang chờ duyệt</span>
        </div>
      </div>

      <div className="alert purple">
        <GraduationCap size={18}/>
        <div>
          <p>5 bài học</p>
          <span>Mới được tạo hôm nay</span>
        </div>
      </div>
    </div>
  );
};

export default SystemAlertsSection;