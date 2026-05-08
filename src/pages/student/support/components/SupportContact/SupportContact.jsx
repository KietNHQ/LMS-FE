import { FaClock, FaEnvelope, FaPhone } from "react-icons/fa";
import "./SupportContact.css";

export default function SupportContact() {
  return (
    <div className="student-support-contact">
      <h3>Kênh liên hệ nhanh</h3>

      <div className="student-contact-grid">
        <div className="student-contact-card">
          <span className="student-contact-icon-wrap">
            <FaEnvelope className="student-contact-icon" />
          </span>
          <div className="student-contact-content">
            <strong>Email hỗ trợ</strong>
            <p>support@school.edu.vn</p>
          </div>
        </div>

        <div className="student-contact-card">
          <span className="student-contact-icon-wrap">
            <FaPhone className="student-contact-icon" />
          </span>
          <div className="student-contact-content">
            <strong>Hotline</strong>
            <p>1900-xxxx</p>
          </div>
        </div>

        <div className="student-contact-card">
          <span className="student-contact-icon-wrap">
            <FaClock className="student-contact-icon" />
          </span>
          <div className="student-contact-content">
            <strong>Giờ làm việc</strong>
            <p>T2-T6: 7:00 - 17:00</p>
          </div>
        </div>
      </div>
    </div>
  );
}


