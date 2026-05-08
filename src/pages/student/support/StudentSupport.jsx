import "./StudentSupport.css";
import { useState } from "react";
import { FaPaperPlane, FaRegClock, FaRobot } from "react-icons/fa";
import FAQList from "./components/FAQList/FAQList";
import SupportContact from "./components/SupportContact/SupportContact";
import SupportHeader from "./components/SupportHeader/SupportHeader";

export default function StudentSupport() {
  const [faqSearch, setFaqSearch] = useState("");

  const faqs = [
    {
      category: "Học tập",
      question: "Làm sao để xem thời khóa biểu tuần này?",
      answer: "Bạn mở mục Thời khóa biểu để xem chi tiết các tiết học theo ngày/tuần.",
      popularity: 96,
    },
    {
      category: "Tài chính",
      question: "Làm sao để xem điểm các bài kiểm tra?",
      answer: "Bạn vào mục Điểm số để xem danh sách điểm các môn học đã được cập nhật.",
      popularity: 90,
    },
    {
      category: "Liên hệ",
      question: "Làm sao nhắn tin giáo viên chủ nhiệm?",
      answer: "Vào mục Liên lạc giáo viên chủ nhiệm và chọn cuộc trò chuyện cần trao đổi.",
      popularity: 86,
    },
    {
      category: "Điểm danh",
      question: "Tôi có thể xem lịch thi ở đâu?",
      answer: "Lịch thi được cập nhật trong mục Thông báo hoặc Lịch học tập của bạn.",
      popularity: 84,
    },
    {
      category: "Thông báo",
      question: "Vì sao thông báo chưa đọc chưa cập nhật?",
      answer: "Hãy tải lại trang và kiểm tra mục Thông báo để đồng bộ số lượng chưa đọc mới nhất.",
      popularity: 75,
    },
    {
      category: "Tài khoản",
      question: "Quên mật khẩu tài khoản học sinh phải làm gì?",
      answer: "Sử dụng Quên mật khẩu ở trang đăng nhập hoặc liên hệ bộ phận hỗ trợ để cấp lại.",
      popularity: 88,
    },
  ];

  const sortedFaqs = [...faqs].sort((a, b) => b.popularity - a.popularity);
  const normalizedKeyword = faqSearch.trim().toLowerCase();

  const filteredFaqs = sortedFaqs.filter((faq) => {
    if (!normalizedKeyword) return true;

    const content = `${faq.category} ${faq.question} ${faq.answer}`.toLowerCase();
    return content.includes(normalizedKeyword);
  });

  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  return (
    <div className="student-support-page">
      <SupportHeader
        faqCount={filteredFaqs.length}
        chatStatus="Hoạt động"
      />

      <div className="student-support-container">
        <FAQList
          groupedFaqs={groupedFaqs}
          keyword={faqSearch}
          onKeywordChange={setFaqSearch}
        />

        <div className="student-support-chat">
          <div className="student-chat-header">
            <h4>
              <FaRobot /> Trợ lý LMS
            </h4>

            <span className="student-chat-status">
              <FaRegClock /> Phản hồi trong 5-10 phút
            </span>
          </div>

          <div className="student-chat-body">
            <div className="student-chat-message is-bot">
              <div className="student-chat-role">Bot</div>
              Xin chào! Tôi là trợ lý LMS dành cho học sinh. Bạn cần hỗ trợ vấn đề nào?
              <div className="student-chat-time">14:48</div>
            </div>

            <div className="student-chat-message is-user">
              <div className="student-chat-role">Bạn</div>
              Tôi muốn xem lịch thi tháng này.
              <div className="student-chat-time">14:49</div>
            </div>

            <div className="student-chat-message is-bot">
              <div className="student-chat-role">Bot</div>
              Bạn vào mục Lịch học tập, chọn tab Lịch thi để xem chi tiết nhé.
              <div className="student-chat-time">14:49</div>
            </div>
          </div>

          <div className="student-chat-input">
            <input placeholder="Nhập câu hỏi cần hỗ trợ..." />
            <button type="button" aria-label="Gửi tin nhắn">
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>

      <footer className="student-support-footer">
        <SupportContact />
      </footer>
    </div>
  );
}
