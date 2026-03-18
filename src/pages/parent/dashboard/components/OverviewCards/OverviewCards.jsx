import "./OverviewCards.css";
import { FiAward, FiTrendingUp, FiBell, FiCreditCard } from "react-icons/fi";

export default function OverviewCards({ yearAvg, hk1Avg }) {
  return (
    <div className="cards">

      {/* ĐTB CẢ NĂM */}
      <div className="card">
        <div>
          <p>ĐTB cả năm</p>
          <h3>{yearAvg}</h3>
        </div>

        <div className="icon purple">
          <FiAward />
        </div>
      </div>

      {/* ĐTB HK1 */}
      <div className="card">
        <div>
          <p>ĐTB HK1</p>
          <h3>{hk1Avg}</h3>
        </div>

        <div className="icon blue">
          <FiTrendingUp />
        </div>
      </div>

      {/* THÔNG BÁO (có thể dynamic sau) */}
      <div className="card">
        <div>
          <p>Thông báo</p>
          <h3>2</h3>
          <span>Chưa đọc</span>
        </div>

        <div className="icon orange">
          <FiBell />
        </div>
      </div>

      {/* HỌC PHÍ */}
      <div className="card">
        <div>
          <p>Học phí chưa đóng</p>
          <h3>5trđ</h3>
        </div>

        <div className="icon red">
          <FiCreditCard />
        </div>
      </div>

    </div>
  );
}