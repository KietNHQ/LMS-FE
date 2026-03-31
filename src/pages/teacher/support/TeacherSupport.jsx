import "./TeacherSupport.css";
import { useState } from "react";
import { FaPaperPlane, FaRegClock, FaRobot } from "react-icons/fa";
import FAQList from "./components/FAQList/FAQList";
import SupportContact from "./components/SupportContact/SupportContact";
import SupportHeader from "./components/SupportHeader/SupportHeader";

export default function TeacherSupport() {
  const [faqSearch, setFaqSearch] = useState("");

  const faqs = [
    {
      category: "Học tập",
      question: "Làm sao để theo dõi kết quả học tập của con?",
      answer: "Bạn mở mục Tổng quan con em hoặc Điểm số để xem chi tiết theo học kỳ.",
      popularity: 96,
    },
    {
      category: "Tài chính",
      question: "Phụ huynh thanh toán học phí cho con ở đâu?",
      answer: "Bạn có thể thanh toán trong mục Thanh toán hoặc liên hệ phòng tài vụ để được hỗ trợ.",
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
      question: "Có thể xem lịch sử điểm danh theo tháng không?",
      answer: "Có, hệ thống cho phép xem điểm danh tuần/tháng trong phần Tổng quan con em.",
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
      question: "Quên mật khẩu tài khoản phụ huynh phải làm gì?",
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
    <div className="teacher-support-page">
      <SupportHeader
        faqCount={filteredFaqs.length}
        chatStatus="Hoạt động"
      />

      <div className="teacher-support-container">
        <FAQList
          groupedFaqs={groupedFaqs}
          keyword={faqSearch}
          onKeywordChange={setFaqSearch}
        />

        <div className="teacher-support-chat">
          <div className="teacher-chat-header">
            <h4>
              <FaRobot /> Trợ lý LMS
            </h4>

            <span className="teacher-chat-status">
              <FaRegClock /> Phản hồi trong 5-10 phút
            </span>
          </div>

          <div className="teacher-chat-body">
            <div className="teacher-chat-message is-bot">
              <div className="teacher-chat-role">Bot</div>
              Xin chào! Tôi là trợ lý LMS dành cho phụ huynh. Bạn cần hỗ trợ vấn đề nào?
              <div className="teacher-chat-time">14:48</div>
            </div>

            <div className="teacher-chat-message is-user">
              <div className="teacher-chat-role">Bạn</div>
              Tôi muốn xem lịch sử điểm danh của con trong tháng này.
              <div className="teacher-chat-time">14:49</div>
            </div>

            <div className="teacher-chat-message is-bot">
              <div className="teacher-chat-role">Bot</div>
              Bạn vào Tổng quan con em, chọn tab Điểm danh và xem bộ lọc theo tháng.
              <div className="teacher-chat-time">14:49</div>
            </div>
          </div>

          <div className="teacher-chat-input">
            <input placeholder="Nhập câu hỏi cần hỗ trợ..." />
            <button type="button" aria-label="Gửi tin nhắn">
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>

      <footer className="teacher-support-footer">
        <SupportContact />
      </footer>
    </div>
  );
}