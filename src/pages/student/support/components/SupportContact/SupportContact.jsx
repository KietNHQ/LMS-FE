import { FaEnvelope, FaPhone, FaClock } from "react-icons/fa";
import "./SupportContact.css";

export default function SupportContact() {
    return (
        <div className="support-contact">
            <h3>Liên hệ trực tiếp</h3>

            <div className="contact-grid">
                <div className="contact-card">
                    <FaEnvelope className="contact-icon" />
                    <div>
                        <strong>Email hỗ trợ</strong>
                        <p>support@school.edu.vn</p>
                    </div>
                </div>

                <div className="contact-card">
                    <FaPhone className="contact-icon" />
                    <div>
                        <strong>Hotline</strong>
                        <p>1900-xxxx</p>
                    </div>
                </div>

                <div className="contact-card">
                    <FaClock className="contact-icon" />
                    <div>
                        <strong>Giờ làm việc</strong>
                        <p>T2-T6: 7:00 - 17:00</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
