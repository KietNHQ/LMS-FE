import { useEffect, useRef, useState } from "react";
import studentService from "../../../services/pages/student/studentService";
import "./StudentSupport.css";
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

const STUDENT_SUPPORT_INTENTS = [
  {
    id: "schedule",
    category: "Lịch học",
    question: "Xem thời khóa biểu ở đâu?",
    label: "thời khóa biểu",
    icon: "📅",
    answer: "Bạn mở mục Thời khóa biểu để xem các tiết học theo ngày hoặc theo tuần.",
    path: ["Thời khóa biểu", "Chọn tuần", "Xem tiết học"],
    note: "Nếu lịch trống, kiểm tra đúng năm học/học kỳ hoặc tải lại trang.",
    keywords: [
      "thời khóa biểu",
      "lịch học",
      "tkb",
      "schedule",
      "timetable",
      "hôm nay học gì",
      "tuần này học gì",
      "class today",
      "mon hoc hom nay",
    ],
  },
  {
    id: "grades",
    category: "Điểm số",
    question: "Xem điểm ở đâu?",
    label: "điểm số",
    icon: "📊",
    answer: "Bạn vào mục Điểm số để xem điểm từng môn theo học kỳ.",
    path: ["Điểm số", "Chọn HK I / HK II / Cả năm", "Xem chi tiết môn"],
    note: "Nếu chưa có điểm, có thể giáo viên chưa nhập hoặc điểm chưa được duyệt.",
    keywords: [
      "điểm",
      "điểm số",
      "xem điểm",
      "grade",
      "score",
      "marks",
      "kết quả học tập",
      "trung bình",
      "xếp loại",
      "how am i doing",
      "diem cua toi",
    ],
  },
  {
    id: "quiz",
    category: "Bài kiểm tra",
    question: "Làm bài kiểm tra online ở đâu?",
    label: "bài kiểm tra",
    icon: "🧪",
    answer: "Bạn mở mục Bài kiểm tra để xem quiz đang mở và bắt đầu làm bài.",
    path: ["Bài kiểm tra", "Chọn bài đang mở", "Bắt đầu làm bài", "Nộp bài"],
    note: "Hãy kiểm tra thời gian mở/đóng bài trước khi làm để không bị quá hạn.",
    keywords: [
      "quiz",
      "bài kiểm tra",
      "kiểm tra online",
      "làm bài",
      "test",
      "exam online",
      "submit quiz",
      "nộp bài",
      "không thấy quiz",
    ],
  },
  {
    id: "exam",
    category: "Lịch thi",
    question: "Xem lịch thi ở đâu?",
    label: "lịch thi",
    icon: "📅",
    answer: "Lịch thi thường được cập nhật trong mục Thông báo hoặc Lịch học tập.",
    path: ["Thông báo", "Lịch thi / Lịch học tập", "Chọn học kỳ"],
    note: "Nên kiểm tra lại gần ngày thi vì nhà trường có thể cập nhật lịch mới.",
    keywords: [
      "lịch thi",
      "thi",
      "exam",
      "exam schedule",
      "test schedule",
      "lịch kiểm tra",
      "thi tuần này",
      "kiem tra tuan nay",
    ],
  },
  {
    id: "teacher_message",
    category: "Liên hệ",
    question: "Nhắn giáo viên chủ nhiệm ở đâu?",
    label: "nhắn giáo viên",
    icon: "💬",
    answer: "Bạn vào mục trò chuyện để nhắn giáo viên chủ nhiệm hoặc giáo viên bộ môn.",
    path: ["Trò chuyện", "Chọn giáo viên", "Nhập tin nhắn", "Gửi"],
    note: "Nếu chưa thấy giáo viên, kiểm tra lại lớp hiện tại hoặc liên hệ văn phòng.",
    keywords: [
      "nhắn giáo viên",
      "giáo viên chủ nhiệm",
      "gvcn",
      "chat teacher",
      "message teacher",
      "contact teacher",
      "liên hệ giáo viên",
      "hoi thay co",
    ],
  },
  {
    id: "password",
    category: "Tài khoản",
    question: "Quên mật khẩu thì làm gì?",
    label: "mật khẩu",
    icon: "🔑",
    answer: "Bạn dùng chức năng Quên mật khẩu ở màn hình đăng nhập để nhận link đặt lại qua email.",
    path: ["Đăng nhập", "Quên mật khẩu", "Nhập email", "Kiểm tra hộp thư"],
    note: "Nếu tài khoản học sinh chưa có email, hãy nhờ phụ huynh hoặc nhà trường hỗ trợ cấp lại.",
    keywords: [
      "quên mật khẩu",
      "mất mật khẩu",
      "không đăng nhập",
      "forgot password",
      "reset password",
      "locked out",
      "password gone",
      "quen pass",
      "mat mk",
    ],
  },
  {
    id: "profile",
    category: "Tài khoản",
    question: "Cập nhật thông tin cá nhân ở đâu?",
    label: "thông tin cá nhân",
    icon: "🛠️",
    answer: "Bạn mở cài đặt tài khoản để cập nhật thông tin liên hệ nếu hệ thống cho phép.",
    path: ["Tài khoản", "Cài đặt tài khoản", "Cập nhật thông tin"],
    note: "Một số thông tin học sinh có thể cần nhà trường chỉnh sửa.",
    keywords: [
      "thông tin cá nhân",
      "email",
      "số điện thoại",
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
    answer: "Đây thường là lỗi đồng bộ tạm thời. Bạn hãy tải lại trang để cập nhật lại số thông báo chưa đọc.",
    path: ["Nhấn F5", "Mở Thông báo", "Kiểm tra lại số chưa đọc"],
    note: "Nếu vẫn lỗi, đăng xuất rồi đăng nhập lại để làm mới phiên.",
    keywords: [
      "thông báo",
      "notification",
      "unread",
      "chưa đọc",
      "không cập nhật",
      "sync",
      "f5",
      "refresh",
      "not update",
    ],
  },
];

const STUDENT_LOCAL_FAQS = STUDENT_SUPPORT_INTENTS.map(({ id, category, question, answer, note, keywords }) => ({
  id: `student-support-${id}`,
  category,
  question,
  answer: `${answer} ${note}`,
  keywords,
  popularity: 100,
}));

const STUDENT_QUICK_ACTION_GROUPS = [
  {
    category: "Học tập",
    actions: ["📅 Xem thời khóa biểu", "📊 Xem điểm của em"],
  },
  {
    category: "Kiểm tra",
    actions: ["🧪 Làm bài kiểm tra online", "📅 Xem lịch thi"],
  },
  {
    category: "Tài khoản",
    actions: ["🔑 Em quên mật khẩu", "🛠️ Đổi thông tin cá nhân"],
  },
  {
    category: "Liên hệ",
    actions: ["💬 Nhắn giáo viên chủ nhiệm", "🔔 Thông báo chưa đọc không cập nhật"],
  },
];

export default function StudentSupport() {
  const [faqSearch, setFaqSearch] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "init",
      role: "assistant",
      content: "Chào bạn! Tôi là trợ lý LMS. Bạn có thể hỏi về lịch học, điểm số, bài kiểm tra, mật khẩu hoặc chọn nhanh bên dưới.",
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
        const response = await studentService.listFaqs({ mock: false });
        setFaqs(response.success && Array.isArray(response.data) ? response.data : []);
      } catch {
        console.warn("Real FAQs API failed, using local student support guide.");
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
  const displayFaqs = [...STUDENT_LOCAL_FAQS, ...apiFaqs];
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
    const scored = STUDENT_SUPPORT_INTENTS.map((intent) => {
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
      `Mình hiểu bạn đang hỏi về ${intent.label}.`,
      intent.answer,
      `${intent.icon} ${intent.path.join(" ➡️ ")}`,
      intent.note,
    ].join("\n");
  };

  const buildFallbackResponse = () => {
    return [
      "Mình chưa có hướng dẫn chắc chắn cho câu này nên mình không đoán bừa.",
      "Bạn thử hỏi lại bằng các từ khóa như: lịch học, điểm số, bài kiểm tra, lịch thi, mật khẩu, thông báo hoặc giáo viên chủ nhiệm.",
      "Nếu đang gấp, hãy nhắn giáo viên chủ nhiệm hoặc liên hệ văn phòng trường.",
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
    <div className="student-support-page">
      <SupportHeader
        faqCount={isLoading ? "..." : filteredFaqs.length}
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
              <FaRegClock /> Trực tuyến
            </span>
          </div>

          <div className="student-chat-body" ref={chatBodyRef}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`student-chat-message ${msg.role === "assistant" ? "is-bot" : "is-user"} ${msg.isError ? "is-error" : ""} ${msg.isThinking ? "typing" : ""}`}
              >
                <div className="student-chat-role">
                  {msg.role === "assistant" ? "Bot" : "Bạn"}
                </div>
                <div className="student-chat-content">{msg.content}</div>
                {msg.category && <div className="student-chat-category">Chủ đề: {msg.category}</div>}
                {msg.relatedQuestion && <div className="student-chat-related">Gợi ý: {msg.relatedQuestion}</div>}
                <div className="student-chat-time">{msg.time}</div>
              </div>
            ))}
          </div>

          {showQuickActions && (
            <div className="student-chat-quick-actions">
              <span className="student-quick-action-label">Chọn nhanh:</span>
              {STUDENT_QUICK_ACTION_GROUPS.map((group) => (
                <div className="student-quick-action-group" key={group.category}>
                  <span className="student-quick-action-group-title">{group.category}</span>
                  <div className="student-quick-action-buttons">
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

          <div className="student-chat-input">
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

      <footer className="student-support-footer">
        <SupportContact />
      </footer>
    </div>
  );
}
