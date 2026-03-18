import "./StudentSupport.css";
import { useState } from "react";
import {
  FaRobot,
  FaPaperPlane,
  FaRegClock
} from "react-icons/fa";
import SupportHeader from "./components/SupportHeader/SupportHeader";
import FAQList from "./components/FAQList/FAQList";
import SupportContact from "./components/SupportContact/SupportContact";

export default function StudentSupport() {
  const [faqSearch, setFaqSearch] = useState("");

  const faqs = [
    {
      category: "Học tập",
      question: "Làm sao để nộp bài tập?",
      answer: "Truy cập lớp học, chọn bài tập và tải tệp trước hạn nộp.",
      popularity: 95
    },
    {
      category: "Tài chính",
      question: "Học phí được thanh toán như thế nào?",
      answer: "Bạn có thể thanh toán online hoặc tại phòng tài vụ theo thông báo của trường.",
      popularity: 70
    },
    {
      category: "Liên hệ",
      question: "Làm sao để liên hệ với giáo viên?",
      answer: "Vào mục Tin nhắn trong LMS để gửi trao đổi trực tiếp cho giáo viên bộ môn.",
      popularity: 78
    },
    {
      category: "Điểm danh",
      question: "Điểm danh được ghi nhận khi nào?",
      answer: "Điểm danh được cập nhật ngay sau khi giáo viên hoàn tất buổi học.",
      popularity: 83
    },
    {
      category: "Giảng dạy",
      question: "Làm thế nào để tạo quiz?",
      answer: "Chức năng tạo quiz chỉ dành cho tài khoản giáo viên hoặc quản trị viên.",
      popularity: 52
    },
    {
      category: "Tài khoản",
      question: "Quên mật khẩu thì làm thế nào?",
      answer: "Bạn dùng mục Quên mật khẩu tại đăng nhập hoặc vào Hồ sơ để đổi mật khẩu.",
      popularity: 92
    },
    {
      category: "Lịch học",
      question: "Lịch học thay đổi có được báo không?",
      answer: "Có. Hệ thống sẽ gửi thông báo khi có thay đổi lịch học hoặc phòng học.",
      popularity: 80
    },
    {
      category: "Điểm số",
      question: "Khi nào điểm kiểm tra được cập nhật?",
      answer: "Điểm được cập nhật sau khi giáo viên chấm và xác nhận lên hệ thống.",
      popularity: 84
    }
  ];

  const sortedFaqs = [...faqs].sort((a, b) => b.popularity - a.popularity);

  const normalizedKeyword = faqSearch.trim().toLowerCase();

  const filteredFaqs = sortedFaqs.filter((faq) => {
    if (!normalizedKeyword) return true;
    const content = `${faq.category} ${faq.question} ${faq.answer}`.toLowerCase();
    return content.includes(normalizedKeyword);
  });

  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return (
    <div className="support-page">

      <SupportHeader
        faqCount={filteredFaqs.length}
        chatStatus="Hoạt động"
      />

      <div className="support-container">

        <FAQList
          groupedFaqs={groupedFaqs}
          keyword={faqSearch}
          onKeywordChange={setFaqSearch}
        />

        <div className="support-chat">

          <div className="chat-header">
            <h4>
              <FaRobot /> Trợ lý LMS
            </h4>
            <span className="chat-status">
              <FaRegClock /> Phản hồi trong 5-10 phút
            </span>
          </div>

          <div className="chat-body">

            <div className="chat-message is-bot">
              <div className="chat-role">Bot</div>

              Xin chào! Tôi là trợ lý LMS. Bạn cần hỗ trợ vấn đề nào?

              <div className="chat-time">14:48</div>
            </div>

            <div className="chat-message is-user">
              <div className="chat-role">Ban</div>
              Em quên mật khẩu và muốn đổi lại.
              <div className="chat-time">14:49</div>
            </div>

            <div className="chat-message is-bot">
              <div className="chat-role">Bot</div>
              Bạn vào Hồ sơ cá nhân, chọn Đổi mật khẩu và nhập thông tin mới.
              <div className="chat-time">14:49</div>
            </div>

          </div>

          <div className="chat-input">
            <input placeholder="Nhập câu hỏi cần hỗ trợ..." />
            <button type="button" aria-label="Gui tin nhan">
              <FaPaperPlane />
            </button>
          </div>

        </div>

      </div>

      <footer className="support-footer">
        <SupportContact />
      </footer>

    </div>
  );
}