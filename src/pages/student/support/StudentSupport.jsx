import "./StudentSupport.css";
import { useState } from "react";

export default function StudentSupport() {

  const [open, setOpen] = useState(null);

  const faqs = [
    {
      category: "Tài khoản",
      question: "Làm sao để đổi mật khẩu?",
      answer: "Bạn vào phần Cài đặt tài khoản và chọn Đổi mật khẩu."
    },
    {
      category: "Tài khoản",
      question: "Tôi quên mật khẩu thì phải làm sao?",
      answer: "Sử dụng chức năng Quên mật khẩu tại trang đăng nhập."
    },
    {
      category: "Điểm số",
      question: "Làm thế nào để xem điểm số?",
      answer: "Truy cập mục Xem điểm trên sidebar."
    },
    {
      category: "Học tập",
      question: "Thời khóa biểu ở đâu?",
      answer: "Bạn có thể xem trong mục Thời khóa biểu."
    },
    {
      category: "Học tập",
      question: "Làm sao để nộp bài tập?",
      answer: "Truy cập bài học và chọn Nộp bài."
    },
    {
      category: "Tài chính",
      question: "Học phí được thanh toán như thế nào?",
      answer: "Thanh toán qua cổng thanh toán online hoặc tại phòng tài vụ."
    },
    {
      category: "Liên hệ",
      question: "Làm sao để liên hệ với giáo viên?",
      answer: "Bạn có thể gửi tin nhắn qua hệ thống hoặc email."
    },
    {
      category: "Điểm danh",
      question: "Điểm danh được ghi nhận khi nào?",
      answer: "Sau khi giáo viên xác nhận điểm danh."
    },
    {
      category: "Giảng dạy",
      question: "Làm thế nào để tạo quiz?",
      answer: "Chức năng này dành cho giáo viên."
    },
    {
      category: "Thông báo",
      question: "Thông báo từ trường được gửi như thế nào?",
      answer: "Thông báo hiển thị trong mục Thông báo."
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

      {/* SEARCH */}
      <div className="support-search">
        <span className="search-icon">🔍</span>
        <input placeholder="Tìm kiếm câu hỏi..." />
      </div>

      <div className="support-container">

        {/* FAQ */}
        <div className="support-faq">

          <div className="faq-title">
            <span className="faq-icon">❓</span>
            <h3>Câu hỏi thường gặp</h3>
          </div>

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

        {/* CHAT */}
        <div className="support-chat">

          <div className="chat-header">
            <h4>🤖 Trợ lý ảo LMS</h4>
            <span>Luôn sẵn sàng hỗ trợ</span>
          </div>

          <div className="chat-body">

            <div className="chat-message">
              <div className="chat-role">Trợ lý</div>

              Xin chào! Tôi là trợ lý ảo của hệ thống LMS.
              Bạn có câu hỏi gì cần hỗ trợ không?

              <div className="chat-time">14:48</div>
            </div>

          </div>

          <div className="chat-input">
            <input placeholder="Nhập câu hỏi của bạn..." />
            <button>➤</button>
          </div>

          <div className="chat-note">
            Nếu bot không trả lời được, câu hỏi sẽ gửi đến Admin
          </div>

        </div>

      </div>

      {/* CONTACT */}
      <div className="support-contact">

        <h3>Liên hệ trực tiếp</h3>

        <div className="contact-grid">

          <div className="contact-card">
            <div className="contact-icon email">📧</div>
            <div>
              <strong>Email hỗ trợ</strong>
              <p>support@school.edu.vn</p>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-icon phone">📞</div>
            <div>
              <strong>Hotline</strong>
              <p>1900-xxxx</p>
            </div>
          </div>

          <div className="contact-card">
            <div className="contact-icon time">🕒</div>
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