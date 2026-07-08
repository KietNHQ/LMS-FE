import "./OverviewCards.css";
import { FiAward, FiTrendingUp, FiBell, FiCreditCard } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function OverviewCards({ yearAvg, hk1Avg, unreadCount, unpaidAmount }) {
  const navigate = useNavigate();

  return (
    <div className="cards">

      {/* ĐTB CẢ NĂM */}
      <div className="card clickable" onClick={() => navigate("/parent/children-overview")}>
        <div className="card-info-content">
          <p>ĐTB cả năm</p>
          <h3>{yearAvg || "--"}</h3>
          <span className="card-action-link">Xem chi tiết &rsaquo;</span>
        </div>

        <div className="icon purple">
          <FiAward />
        </div>
      </div>

      {/* ĐTB HK1 */}
      <div className="card clickable" onClick={() => navigate("/parent/children-overview")}>
        <div className="card-info-content">
          <p>ĐTB HK1</p>
          <h3>{hk1Avg || "--"}</h3>
          <span className="card-action-link">Xem chi tiết &rsaquo;</span>
        </div>

        <div className="icon blue">
          <FiTrendingUp />
        </div>
      </div>

      {/* THÔNG BÁO */}
      <div className="card clickable" onClick={() => navigate("/parent/notifications")}>
        <div className="card-info-content">
          <p>Thông báo</p>
          <h3>{unreadCount || 0}</h3>
          <div className="card-desc-badge">{unreadCount > 0 ? "Chưa đọc" : "Hệ thống"}</div>
          <span className="card-action-link">Xem chi tiết &rsaquo;</span>
        </div>

        <div className="icon orange">
          <FiBell />
        </div>
      </div>

      {/* HỌC PHÍ */}
      <div className="card clickable" onClick={() => navigate("/parent/payments")}>
        <div className="card-info-content">
          <p>Học phí chưa đóng</p>
          <h3>{unpaidAmount || "0đ"}</h3>
          <span className="card-action-link text-red">Thanh toán ngay &rsaquo;</span>
        </div>

        <div className="icon red">
          <FiCreditCard />
        </div>
      </div>

    </div>
  );
}
