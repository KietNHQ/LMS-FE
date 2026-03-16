import "./ParentSupport.css";
import { useState } from "react";
import {
  HelpCircle,
  Bot,
  Mail,
  Phone,
  Clock,
  Send
} from "lucide-react";

export default function ParentSupport() {

  const [open, setOpen] = useState(null);

  const faqs = [
    {
      category: "Học tập",
      question: "Làm sao để theo dõi kết quả học của con?",
      answer: "Bạn có thể xem bảng điểm trong mục Học tập."
    },
    {
      category: "Tài chính",
      question: "Thanh toán học phí cho con như thế nào?",
      answer: "Thanh toán qua chuyển khoản hoặc trực tiếp tại trường."
    },
    {
      category: "Liên hệ",
      question: "Làm sao để liên hệ giáo viên chủ nhiệm?",
      answer: "Bạn có thể gửi tin nhắn qua hệ thống LMS."
    },
    {
      category: "Điểm danh",
      question: "Phụ huynh có thể xem lịch sử điểm danh không?",
      answer: "Có, thông tin có trong mục Điểm danh."
    }
  ];

  const groupedFaqs = faqs.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return (
    <div className="parent-support-page">

      <h1>Trung tâm hỗ trợ</h1>

      <div className="parent-support-container">

        {/* FAQ */}
        <div className="parent-support-faq">

          <div className="parent-faq-title">
            <HelpCircle className="parent-faq-icon"/>
            <h3>Câu hỏi thường gặp</h3>
          </div>

          <div className="parent-faq-list">

            {Object.keys(groupedFaqs).map((category, cIndex) => (
              <div key={cIndex} className="parent-faq-category">

                <h4>{category}</h4>

                {groupedFaqs[category].map((faq, index) => {

                  const id = `${cIndex}-${index}`;

                  return (
                    <div
                      key={id}
                      className="parent-faq-item"
                      onClick={() => setOpen(open === id ? null : id)}
                    >

                      <div className="parent-faq-question">
                        {faq.question}
                        <span>{open === id ? "▲" : "▼"}</span>
                      </div>

                      {open === id && (
                        <div className="parent-faq-answer">
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
        <div className="parent-support-chat">

          <div className="parent-chat-header">
            <h4>
              <Bot/> Trợ lý LMS
            </h4>
          </div>

          <div className="parent-chat-body">

            <div className="parent-chat-message">
              <div className="parent-chat-role">Bot</div>

              Xin chào! Tôi là trợ lý LMS.  
              Bạn cần hỗ trợ gì?

              <div className="parent-chat-time">14:48</div>
            </div>

          </div>

          <div className="parent-chat-input">
            <input placeholder="Nhập câu hỏi..." />
            <button>
              <Send size={18}/>
            </button>
          </div>

        </div>

      </div>

      {/* CONTACT */}
      <div className="parent-support-contact">

        <h3>Liên hệ trực tiếp</h3>

        <div className="parent-contact-grid">

          <div className="parent-contact-card">
            <Mail className="parent-contact-icon"/>
            <div>
              <strong>Email hỗ trợ</strong>
              <p>support@school.edu.vn</p>
            </div>
          </div>

          <div className="parent-contact-card">
            <Phone className="parent-contact-icon"/>
            <div>
              <strong>Hotline</strong>
              <p>1900-xxxx</p>
            </div>
          </div>

          <div className="parent-contact-card">
            <Clock className="parent-contact-icon"/>
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