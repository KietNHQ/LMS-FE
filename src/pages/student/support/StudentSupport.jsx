import "./StudentSupport.css";
import { useState } from "react";
import {
  FaRobot,
  FaPaperPlane
} from "react-icons/fa";
import SupportHeader from "./components/SupportHeader/SupportHeader";
import FAQList from "./components/FAQList/FAQList";
import SupportContact from "./components/SupportContact/SupportContact";

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

      <SupportHeader />

      <div className="support-container">

        <FAQList
          groupedFaqs={groupedFaqs}
          open={open}
          onToggle={(id) => setOpen(open === id ? null : id)}
        />

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

      <SupportContact />

    </div>
  );
}