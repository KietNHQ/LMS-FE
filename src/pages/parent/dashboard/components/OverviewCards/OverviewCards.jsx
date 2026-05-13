import "./OverviewCards.css";
import { FiAward, FiTrendingUp, FiBell, FiCreditCard } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function OverviewCards({ yearAvg, hk1Avg, unreadCount }) {
  const navigate = useNavigate();

  return (
    <div className="cards">

      {/* ĐTB CẢ NĂM */}
      <div className="card clickable" onClick={() => navigate("/parent/grades")}>
        <div>
          <p>ĐTB cả năm</p>
          <h3>{yearAvg}</h3>
        </div>

        <div className="icon purple">
          <FiAward />
        </div>
      </div>

      {/* ĐTB HK1 */}
      <div className="card clickable" onClick={() => navigate("/parent/grades")}>
        <div>
          <p>ĐTB HK1</p>
          <h3>{hk1Avg}</h3>
        </div>

        <div className="icon blue">
          <FiTrendingUp />
        </div>
      </div>

      {/* THÔNG BÁO */}
      <div className="card clickable" onClick={() => navigate("/parent/notifications")}>
        <div>
          <p>Thông báo</p>
          <h3>{unreadCount || 0}</h3>
          <span>{unreadCount > 0 ? "Chưa đọc" : "Hệ thống"}</span>
        </div>

        <div className="icon orange">
          <FiBell />
        </div>
      </div>

      {/* HỌC PHÍ */}
      <div className="card clickable" onClick={() => navigate("/parent/finance")}>
        <div>
          <p>Học phí chưa đóng</p>
          <h3>---</h3>
        </div>

        <div className="icon red">
          <FiCreditCard />
        </div>
      </div>

    </div>
  );
}
