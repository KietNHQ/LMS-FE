import { FaEnvelope, FaPhone, FaClock } from "react-icons/fa";
import "./SupportContact.css";

export default function SupportContact() {
    return (
        <div className="support-contact">
            <h3>Kênh liên hệ nhanh</h3>

            <div className="contact-grid">
                <div className="contact-card">
                    <span className="contact-icon-wrap">
                        <FaEnvelope className="contact-icon" />
                    </span>
                    <div className="contact-content">
                        <strong>Email hỗ trợ</strong>
                        <p>support@school.edu.vn</p>
                    </div>
                </div>

                <div className="contact-card">
                    <span className="contact-icon-wrap">
                        <FaPhone className="contact-icon" />
                    </span>
                    <div className="contact-content">
                        <strong>Hotline</strong>
                        <p>1900-xxxx</p>
                    </div>
                </div>

                <div className="contact-card">
                    <span className="contact-icon-wrap">
                        <FaClock className="contact-icon" />
                    </span>
                    <div className="contact-content">
                        <strong>Giờ làm việc</strong>
                        <p>T2-T6: 7:00 - 17:00</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
