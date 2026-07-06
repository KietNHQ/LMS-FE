import { useEffect, useRef, useState } from "react";
import teacherService from "../../../services/pages/teacher/teacherService";
import "./TeacherSupport.css";
import { FaPaperPlane, FaRegClock, FaRobot } from "react-icons/fa";
import FAQList from "./components/FAQList/FAQList";
import SupportContact from "./components/SupportContact/SupportContact";
import SupportHeader from "./components/SupportHeader/SupportHeader";

const normalizeText = (text = "") => {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, (m) => (m === "đ" ? "d" : "D"))
    .replace(/[^\w\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const TEACHER_SUPPORT_INTENTS = [
  {
    id: "lesson_upload",
    category: "Bài giảng",
    question: "Làm sao tải tài liệu bài học?",
    label: "tài liệu bài học",
    icon: "📎",
    answer: "Thầy/cô có thể mở bài học cần chỉnh sửa rồi đính kèm tệp tài liệu cho lớp.",
    path: ["Bài giảng", "Chọn bài học", "Đính kèm tệp", "Lưu thay đổi"],
    note: "Nên đặt tên file rõ môn, lớp và tuần học để học sinh dễ tìm.",
    keywords: [
      "tải tài liệu",
      "đính kèm",
      "file bài học",
      "lesson material",
      "upload lesson",
      "attachment",
      "gửi tài liệu",
      "slide",
      "pdf",
      "bài giảng",
    ],
  },
  {
    id: "grades",
    category: "Điểm số",
    question: "Nhập điểm cho lớp ở đâu?",
    label: "nhập điểm",
    icon: "📊",
    answer: "Thầy/cô vào trang quản lý điểm để nhập điểm trực tiếp hoặc nhập hàng loạt bằng file Excel.",
    path: ["Quản lý điểm số", "Chọn lớp/môn", "Nhập điểm", "Lưu / Gửi duyệt"],
    note: "Nếu bảng điểm đang khóa, hãy tạo yêu cầu mở khóa trước khi sửa.",
    keywords: [
      "nhập điểm",
      "điểm số",
      "bảng điểm",
      "excel",
      "bulk grade",
      "import grade",
      "score",
      "grade",
      "gửi duyệt",
      "sửa điểm",
    ],
  },
  {
    id: "unlock_grade",
    category: "Điểm số",
    question: "Bảng điểm bị khóa thì làm gì?",
    label: "mở khóa điểm",
    icon: "🔓",
    answer: "Khi điểm đã khóa, thầy/cô cần gửi yêu cầu mở khóa để quản lý phê duyệt trước khi chỉnh sửa.",
    path: ["Quản lý điểm số", "Yêu cầu mở khóa", "Nhập lý do", "Gửi yêu cầu"],
    note: "Ghi rõ lớp, môn, cột điểm và lý do cần chỉnh để được xử lý nhanh.",
    keywords: [
      "mở khóa điểm",
      "unlock grade",
      "bị khóa",
      "khóa điểm",
      "không sửa được điểm",
      "request unlock",
      "grade locked",
    ],
  },
  {
    id: "schedule",
    category: "Thời khóa biểu",
    question: "Không thấy lịch dạy thì kiểm tra ở đâu?",
    label: "lịch dạy",
    icon: "📅",
    answer: "Thầy/cô kiểm tra thời khóa biểu theo đúng năm học, học kỳ và tuần đang xem.",
    path: ["Thời khóa biểu", "Chọn năm học/học kỳ", "Chọn tuần", "Tải lại trang"],
    note: "Nếu vẫn trống, cần kiểm tra phân công giảng dạy với giáo vụ.",
    keywords: [
      "lịch dạy",
      "thời khóa biểu",
      "tkb",
      "schedule",
      "timetable",
      "không thấy lịch",
      "tuần tới",
      "phân công",
    ],
  },
  {
    id: "quiz",
    category: "Bài kiểm tra",
    question: "Tạo bài kiểm tra ở đâu?",
    label: "bài kiểm tra",
    icon: "🧪",
    answer: "Thầy/cô có thể tạo bài kiểm tra mới rồi gán lớp, thời gian làm bài và câu hỏi.",
    path: ["Bài kiểm tra", "Tạo bài kiểm tra", "Chọn lớp/môn", "Thêm câu hỏi", "Công bố"],
    note: "Kiểm tra lại thời gian mở/đóng bài để học sinh thấy đúng lịch.",
    keywords: [
      "tạo quiz",
      "bài kiểm tra",
      "kiểm tra online",
      "quiz",
      "test",
      "exam",
      "question",
      "câu hỏi",
      "công bố",
    ],
  },
  {
    id: "homeroom",
    category: "Chủ nhiệm",
    question: "Xem lớp chủ nhiệm ở đâu?",
    label: "lớp chủ nhiệm",
    icon: "🏫",
    answer: "Thầy/cô mở trang chủ nhiệm để xem tổng quan học sinh, nề nếp và các thông tin lớp.",
    path: ["Chủ nhiệm", "Tổng quan lớp", "Chọn học kỳ / tuần cần xem"],
    note: "Dữ liệu có thể phụ thuộc năm học hiện tại của lớp chủ nhiệm.",
    keywords: [
      "chủ nhiệm",
      "lớp chủ nhiệm",
      "homeroom",
      "dashboard chủ nhiệm",
      "nề nếp",
      "hạnh kiểm",
      "ban cán sự",
    ],
  },
  {
    id: "messages",
    category: "Liên hệ",
    question: "Nhắn phụ huynh hoặc học sinh ở đâu?",
    label: "trò chuyện",
    icon: "💬",
    answer: "Thầy/cô vào mục trò chuyện để mở cuộc hội thoại với phụ huynh hoặc học sinh liên quan.",
    path: ["Trò chuyện", "Chọn liên hệ", "Nhập tin nhắn", "Gửi"],
    note: "Nếu không thấy phụ huynh, kiểm tra học sinh đã có người giám hộ liên kết chưa.",
    keywords: [
      "nhắn phụ huynh",
      "nhắn học sinh",
      "chat",
      "message",
      "contact parent",
      "liên hệ phụ huynh",
      "trò chuyện",
    ],
  },
  {
    id: "profile",
    category: "Tài khoản",
    question: "Cập nhật thông tin cá nhân ở đâu?",
    label: "thông tin cá nhân",
    icon: "🛠️",
    answer: "Thầy/cô mở trang cá nhân để cập nhật số điện thoại hoặc email.",
    path: ["Ảnh đại diện / Tài khoản", "Trang cá nhân", "Cập nhật thông tin"],
    note: "Nếu thông tin chưa đổi ngay, tải lại trang sau khi lưu.",
    keywords: [
      "thông tin cá nhân",
      "số điện thoại",
      "email",
      "profile",
      "account",
      "change phone",
      "đổi thông tin",
    ],
  },
  {
    id: "notification",
    category: "Thông báo",
    question: "Thông báo chưa đọc không cập nhật thì làm gì?",
    label: "đồng bộ thông báo",
    icon: "🔔",
    answer: "Đây thường là lỗi đồng bộ tạm thời. Thầy/cô hãy tải lại trang để làm mới số thông báo chưa đọc.",
    path: ["Nhấn F5", "Mở Thông báo", "Kiểm tra lại số chưa đọc"],
    note: "Nếu vẫn không đổi, đăng xuất rồi đăng nhập lại để làm mới phiên làm việc.",
    keywords: [
      "thông báo",
      "notification",
      "unread",
      "chưa đọc",
      "không cập nhật",
      "sync",
      "f5",
      "refresh",
    ],
  },
];

const TEACHER_LOCAL_FAQS = TEACHER_SUPPORT_INTENTS.map(({ id, category, question, answer, note, keywords }) => ({
  id: `teacher-support-${id}`,
  category,
  question,
  answer: `${answer} ${note}`,
  keywords,
  popularity: 100,
}));

const TEACHER_QUICK_ACTION_GROUPS = [
  {
    category: "Giảng dạy",
    actions: ["📎 Tải tài liệu bài học", "🧪 Tạo bài kiểm tra"],
  },
  {
    category: "Điểm số",
    actions: ["📊 Nhập điểm cho lớp", "🔓 Bảng điểm bị khóa"],
  },
  {
    category: "Lịch & lớp",
    actions: ["📅 Không thấy lịch dạy", "🏫 Xem lớp chủ nhiệm"],
  },
  {
    category: "Liên hệ",
    actions: ["💬 Nhắn phụ huynh", "🔔 Thông báo chưa đọc không cập nhật"],
  },
];

export default function TeacherSupport() {
  const [faqSearch, setFaqSearch] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "init",
      role: "assistant",
      content: "Xin chào thầy/cô! Tôi là trợ lý LMS. Thầy/cô có thể hỏi về nhập điểm, lịch dạy, bài kiểm tra, chủ nhiệm hoặc chọn nhanh bên dưới.",
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      setIsLoading(true);
      try {
        const response = await teacherService.getFaqs({ mock: false });
        setFaqs(response.success && Array.isArray(response.data) ? response.data : []);
      } catch {
        console.warn("Real FAQs API failed, using local teacher support guide.");
        setFaqs([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isSending]);

  const apiFaqs = faqs.map((faq) => ({ ...faq, id: faq.id ?? `${faq.category}-${faq.question}` }));
  const displayFaqs = [...TEACHER_LOCAL_FAQS, ...apiFaqs];
  const sortedFaqs = [...displayFaqs].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  const normalizedKeyword = normalizeText(faqSearch);

  const filteredFaqs = sortedFaqs.filter((faq) => {
    if (!normalizedKeyword) return true;
    const content = normalizeText(`${faq.category || ""} ${faq.question || faq.title || ""} ${faq.answer || faq.content || ""} ${(faq.keywords || []).join(" ")}`);
    return content.includes(normalizedKeyword);
  });

  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    const category = faq.category || "Khác";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {});

  const searchSupportIntent = (query) => {
    const normalizedQuery = normalizeText(query);
    const queryWords = normalizedQuery.split(/\s+/).filter((word) => word.length > 2);
    const scored = TEACHER_SUPPORT_INTENTS.map((intent) => {
      let score = 0;
      const searchableText = normalizeText([
        intent.category,
        intent.question,
        intent.label,
        intent.answer,
        intent.note,
        ...(intent.path || []),
        ...(intent.keywords || []),
      ].join(" "));

      if (searchableText.includes(normalizedQuery)) score += 10;

      for (const keyword of intent.keywords || []) {
        const normalizedKeywordValue = normalizeText(keyword);
        if (!normalizedKeywordValue) continue;
        if (normalizedQuery === normalizedKeywordValue) score += 12;
        else if (normalizedQuery.includes(normalizedKeywordValue)) score += normalizedKeywordValue.length > 5 ? 8 : 4;
        else if (normalizedKeywordValue.includes(normalizedQuery) && normalizedQuery.length > 3) score += 4;
      }

      for (const word of queryWords) {
        if (searchableText.includes(word)) score += 1;
      }

      return { intent, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.score >= 4 ? scored[0].intent : null;
  };

  const searchApiFaq = (query) => {
    const normalizedQuery = normalizeText(query);
    const queryWords = normalizedQuery.split(/\s+/).filter((word) => word.length > 2);
    const scored = faqs.map((faq) => {
      let score = 0;
      const searchableText = normalizeText(`${faq.category || ""} ${faq.question || faq.title || ""} ${faq.answer || faq.content || ""} ${(faq.keywords || []).join(" ")}`);
      if (searchableText.includes(normalizedQuery)) score += 6;
      for (const word of queryWords) {
        if (searchableText.includes(word)) score += 1;
      }
      return { faq, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.score >= 4 ? scored[0].faq : null;
  };

  const buildIntentResponse = (intent) => {
    return [
      `Dạ, em hiểu thầy/cô đang hỏi về ${intent.label}.`,
      intent.answer,
      `${intent.icon} ${intent.path.join(" ➡️ ")}`,
      intent.note,
    ].join("\n");
  };

  const buildFallbackResponse = () => {
    return [
      "Dạ, em chưa có hướng dẫn chắc chắn cho nội dung này nên em không đoán bừa.",
      "Thầy/cô có thể hỏi lại bằng các từ khóa như: nhập điểm, mở khóa điểm, lịch dạy, bài kiểm tra, lớp chủ nhiệm, tài liệu bài học hoặc thông báo.",
      "Nếu việc đang gấp, thầy/cô nên liên hệ giáo vụ hoặc quản trị hệ thống để xử lý nhanh.",
    ].join("\n");
  };

  const formatTime = () => new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  const handleSendMessage = async (presetMessage) => {
    const userText = (presetMessage ?? inputMessage).trim();
    if (!userText || isSending) return;

    setInputMessage("");
    setIsSending(true);
    setShowQuickActions(false);

    const currentTime = formatTime();
    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userText,
      time: currentTime,
    };

    const botMsgId = `bot-${Date.now()}`;
    const initialBotMsg = {
      id: botMsgId,
      role: "assistant",
      content: "Đang kiểm tra hướng dẫn phù hợp...",
      isThinking: true,
      time: currentTime,
    };

    setMessages((prev) => [...prev, userMsg, initialBotMsg]);

    await new Promise((resolve) => setTimeout(resolve, 450));

    const matchedIntent = searchSupportIntent(userText);
    const apiFaq = matchedIntent ? null : searchApiFaq(userText);
    const content = matchedIntent
      ? buildIntentResponse(matchedIntent)
      : apiFaq?.answer || apiFaq?.content || buildFallbackResponse();

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === botMsgId
          ? {
              ...msg,
              content,
              isThinking: false,
              category: matchedIntent?.category || apiFaq?.category,
              relatedQuestion: matchedIntent?.question || apiFaq?.question || apiFaq?.title,
            }
          : msg,
      ),
    );
    setIsSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="teacher-support-page">
      <SupportHeader
        faqCount={isLoading ? "..." : filteredFaqs.length}
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
              <FaRegClock /> Trực tuyến
            </span>
          </div>

          <div className="teacher-chat-body" ref={chatBodyRef}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`teacher-chat-message ${msg.role === "assistant" ? "is-bot" : "is-user"} ${msg.isError ? "is-error" : ""} ${msg.isThinking ? "typing" : ""}`}
              >
                <div className="teacher-chat-role">
                  {msg.role === "assistant" ? "Bot" : "Bạn"}
                </div>
                <div className="teacher-chat-content">{msg.content}</div>
                {msg.category && <div className="teacher-chat-category">Chủ đề: {msg.category}</div>}
                {msg.relatedQuestion && <div className="teacher-chat-related">Gợi ý: {msg.relatedQuestion}</div>}
                <div className="teacher-chat-time">{msg.time}</div>
              </div>
            ))}
          </div>

          {showQuickActions && (
            <div className="teacher-chat-quick-actions">
              <span className="teacher-quick-action-label">Chọn nhanh:</span>
              {TEACHER_QUICK_ACTION_GROUPS.map((group) => (
                <div className="teacher-quick-action-group" key={group.category}>
                  <span className="teacher-quick-action-group-title">{group.category}</span>
                  <div className="teacher-quick-action-buttons">
                    {group.actions.map((action) => (
                      <button key={action} type="button" onClick={() => handleSendMessage(action)}>
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="teacher-chat-input">
            <input
              placeholder="Nhập câu hỏi cần hỗ trợ..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
            />
            <button
              type="button"
              aria-label="Gửi tin nhắn"
              onClick={() => handleSendMessage()}
              disabled={isSending || !inputMessage.trim()}
            >
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
