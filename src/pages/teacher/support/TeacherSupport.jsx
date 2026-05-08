import { useEffect, useState } from "react";
import teacherService from "../../../services/pages/teacher/teacherService";
import "./TeacherSupport.css";
import { FaPaperPlane, FaRegClock, FaRobot } from "react-icons/fa";
import FAQList from "./components/FAQList/FAQList";
import SupportContact from "./components/SupportContact/SupportContact";
import SupportHeader from "./components/SupportHeader/SupportHeader";

const TEACHER_DEFAULT_FAQS = [
    {
      category: "Giảng dạy",
      question: "Làm sao để tải lên tài liệu bài học?",
      answer: "Bạn vào mục Quản lý bài học, chọn bài cần chỉnh sửa và sử dụng chức năng Đính kèm tệp.",
      popularity: 98,
    },
    {
      category: "Điểm số",
      question: "Cách nhập điểm cho cả lớp nhanh nhất?",
      answer: "Bạn có thể sử dụng chức năng Nhập điểm hàng loạt bằng file Excel hoặc nhập trực tiếp trong lưới điểm.",
      popularity: 95,
    },
    {
      category: "Thời khóa biểu",
      question: "Tại sao tôi không thấy lịch dạy tuần tới?",
      answer: "Vui lòng kiểm tra lại bộ lọc Học kỳ và Năm học. Nếu vẫn không thấy, hãy liên hệ giáo vụ để kiểm tra phân công.",
      popularity: 88,
    },
    {
      category: "Tài khoản",
      question: "Thay đổi thông tin cá nhân như thế nào?",
      answer: "Nhấp vào ảnh đại diện ở Sidebar, chọn Trang cá nhân để cập nhật số điện thoại hoặc email.",
      popularity: 82,
    },
];

export default function TeacherSupport() {
  const [faqSearch, setFaqSearch] = useState("");
  const [notifications, setNotifications] = useState([]); // This might be a mistake in the prompt, should be faqs
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchFaqs = async () => {
      setIsLoading(true);
      try {
        const response = await teacherService.getFaqs({ mock: false });
        if (response.success && response.data?.length > 0) {
          setFaqs(response.data);
        } else {
          setFaqs(TEACHER_DEFAULT_FAQS);
        }
      } catch (error) {
        console.warn("Real FAQs API failed, using teacher mocks.");
        setFaqs(TEACHER_DEFAULT_FAQS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFaqs();
  }, []);

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
              Xin chào! Tôi là trợ lý LMS dành cho giáo viên. Bạn cần hỗ trợ vấn đề nào trong công tác giảng dạy?
              <div className="teacher-chat-time">14:48</div>
            </div>

            <div className="teacher-chat-message is-user">
              <div className="teacher-chat-role">Bạn</div>
              Tôi muốn xem danh sách bài giảng của mình.
              <div className="teacher-chat-time">14:49</div>
            </div>

            <div className="teacher-chat-message is-bot">
              <div className="teacher-chat-role">Bot</div>
              Bạn vào mục Quản lý bài học ở thanh điều hướng bên trái để xem chi tiết danh sách nhé.
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
