import { FaClock, FaEnvelope, FaPhone } from "react-icons/fa";
import "./SupportContact.css";

export default function SupportContact() {
  return (
    <div className="teacher-support-contact">
      <h3>Kênh liên hệ nhanh</h3>

      <div className="teacher-contact-grid">
        <div className="teacher-contact-card">
          <span className="teacher-contact-icon-wrap">
            <FaEnvelope className="teacher-contact-icon" />
          </span>
          <div className="teacher-contact-content">
            <strong>Email hỗ trợ</strong>
            <p>support@school.edu.vn</p>
          </div>
        </div>

        <div className="teacher-contact-card">
          <span className="teacher-contact-icon-wrap">
            <FaPhone className="teacher-contact-icon" />
          </span>
          <div className="teacher-contact-content">
            <strong>Hotline</strong>
            <p>1900-xxxx</p>
          </div>
        </div>

        <div className="teacher-contact-card">
          <span className="teacher-contact-icon-wrap">
            <FaClock className="teacher-contact-icon" />
          </span>
          <div className="teacher-contact-content">
            <strong>Giờ làm việc</strong>
            <p>T2-T6: 7:00 - 17:00</p>
          </div>
        </div>
      </div>
    </div>
  );
}


