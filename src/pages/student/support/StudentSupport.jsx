import "./StudentSupport.css";
import { useState } from "react";
import {
  FaQuestionCircle,
  FaRobot,
  FaEnvelope,
  FaPhone,
  FaClock,
  FaPaperPlane
} from "react-icons/fa";

export default function StudentSupport() {

  const [open, setOpen] = useState(null);

  const faqs = [
    {
      category: "Học tập",
      question: "Làm sao để nộp bài tập?",
      answer: "Truy cập lớp học và chọn bài tập cần nộp."
    },
    {
      category: "Tài chính",
      question: "Học phí được thanh toán như thế nào?",
      answer: "Thanh toán online hoặc tại phòng tài vụ."
    },
    {
      category: "Liên hệ",
      question: "Làm sao để liên hệ với giáo viên?",
      answer: "Bạn có thể gửi tin nhắn qua hệ thống LMS."
    },
    {
      category: "Điểm danh",
      question: "Điểm danh được ghi nhận khi nào?",
      answer: "Sau khi giáo viên xác nhận."
    },
    {
      category: "Giảng dạy",
      question: "Làm thế nào để tạo quiz?",
      answer: "Chức năng này dành cho giáo viên."
    }
  ];

  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return (
    <div className="support-page">

      <h1>Trung tâm hỗ trợ</h1>

      <div className="support-container">

        {/* FAQ */}
        <div className="support-faq">

          <div className="faq-title">
            <FaQuestionCircle className="faq-icon"/>
            <h3>Câu hỏi thường gặp</h3>
          </div>

          <div className="faq-list">

            {Object.keys(groupedFaqs).map((category, cIndex) => (
              <div key={cIndex} className="faq-category">

                <h4>{category}</h4>

                {groupedFaqs[category].map((faq, index) => {

                  const id = `${cIndex}-${index}`;

                  return (
                    <div
                      key={id}
                      className="faq-item"
                      onClick={() => setOpen(open === id ? null : id)}
                    >

                      <div className="faq-question">
                        {faq.question}
                        <span>{open === id ? "▲" : "▼"}</span>
                      </div>

                      {open === id && (
                        <div className="faq-answer">
                          {faq.answer}
                        </div>
                      )}

                    </div>
                  );
                })}

              </div>
            ))}

          </div>

        </div>

        {/* CHAT */}
        <div className="support-chat">

          <div className="chat-header">
            <h4>
              <FaRobot/> Trợ lý LMS
            </h4>
          </div>

          <div className="chat-body">

            <div className="chat-message">
              <div className="chat-role">Bot</div>

              Xin chào! Tôi là trợ lý LMS.  
              Bạn cần hỗ trợ gì?

              <div className="chat-time">14:48</div>
            </div>

          </div>

          <div className="chat-input">
            <input placeholder="Nhập câu hỏi..." />
            <button>
              <FaPaperPlane/>
            </button>
          </div>

        </div>

      </div>

      {/* CONTACT */}
      <div className="support-contact">

        <h3>Liên hệ trực tiếp</h3>

        <div className="contact-grid">

          <div className="contact-card">
            <FaEnvelope className="contact-icon"/>
            <div>
              <strong>Email hỗ trợ</strong>
              <p>support@school.edu.vn</p>
            </div>
          </div>

          <div className="contact-card">
            <FaPhone className="contact-icon"/>
            <div>
              <strong>Hotline</strong>
              <p>1900-xxxx</p>
            </div>
          </div>

          <div className="contact-card">
            <FaClock className="contact-icon"/>
            <div>
              <strong>Giờ làm việc</strong>
              <p>T2-T6: 7:00 - 17:00</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}