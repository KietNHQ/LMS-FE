import { FaClock, FaEnvelope, FaPhone } from "react-icons/fa";
import "./SupportContact.css";

export default function SupportContact() {
  return (
    <div className="parent-support-contact">
      <h3>Kênh liên hệ nhanh</h3>

      <div className="parent-contact-grid">
        <div className="parent-contact-card">
          <span className="parent-contact-icon-wrap">
            <FaEnvelope className="parent-contact-icon" />
          </span>
          <div className="parent-contact-content">
            <strong>Email hỗ trợ</strong>
            <p>support@school.edu.vn</p>
          </div>
        </div>

        <div className="parent-contact-card">
          <span className="parent-contact-icon-wrap">
            <FaPhone className="parent-contact-icon" />
          </span>
          <div className="parent-contact-content">
            <strong>Hotline</strong>
            <p>1900-xxxx</p>
          </div>
        </div>

        <div className="parent-contact-card">
          <span className="parent-contact-icon-wrap">
            <FaClock className="parent-contact-icon" />
          </span>
          <div className="parent-contact-content">
            <strong>Giờ làm việc</strong>
            <p>T2-T6: 7:00 - 17:00</p>
          </div>
        </div>
      </div>
    </div>
  );
}


