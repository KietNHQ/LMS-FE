import "./ParentSupport.css";
import { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaRegClock, FaRobot, FaTicketAlt } from "react-icons/fa";
import FAQList from "./components/FAQList/FAQList";
import SupportContact from "./components/SupportContact/SupportContact";
import SupportHeader from "./components/SupportHeader/SupportHeader";
import { parentService } from "../../../services/pages/parent/parentService";

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

const SUPPORT_INTENTS = [
  {
    id: "grades",
    category: "Học tập & điểm số",
    question: "Xem điểm của con ở đâu?",
    label: "điểm số của con",
    icon: "📊",
    answer: "Dạ, phụ huynh có thể xem điểm theo từng học kỳ trong hồ sơ học sinh.",
    path: ["Học sinh", "Chi tiết học sinh", "Điểm số"],
    note: "Nếu chưa thấy dữ liệu, hãy kiểm tra đúng con, năm học và học kỳ đang xem.",
    keywords: [
      "điểm",
      "điểm số",
      "xem điểm",
      "kết quả học tập",
      "học lực",
      "xếp loại",
      "trung bình",
      "grade",
      "grades",
      "score",
      "marks",
      "how is my kid doing",
      "kid doing in school",
      "con học sao",
      "con minh hoc sao",
      "hoc han the nao",
    ],
  },
  {
    id: "tuition",
    category: "Học phí",
    question: "Thanh toán học phí như thế nào?",
    label: "học phí",
    icon: "💰",
    answer: "Dạ, phụ huynh mở mục Học phí để xem thông báo thu và chuyển khoản theo thông tin tài khoản nhà trường.",
    path: ["Học phí", "Chọn khoản thu", "Xem thông tin chuyển khoản"],
    note: "Mục này cũng giúp kiểm tra khoản còn nợ hoặc đã thanh toán.",
    keywords: [
      "học phí",
      "hoc phi",
      "đóng tiền",
      "nộp tiền",
      "thanh toán",
      "chuyển khoản",
      "công nợ",
      "còn nợ",
      "tuition",
      "fee",
      "fees",
      "pay",
      "payment",
      "outstanding",
      "drop the cash",
      "where do i drop the cash",
    ],
  },
  {
    id: "leave",
    category: "Liên hệ nhà trường",
    question: "Xin nghỉ học cho con như thế nào?",
    label: "xin nghỉ học",
    icon: "📝",
    answer: "Dạ, phụ huynh liên hệ trực tiếp giáo viên chủ nhiệm để báo nghỉ học cho con.",
    path: ["Liên hệ GVCN", "Chọn cuộc trò chuyện", "Gửi nội dung xin nghỉ"],
    note: "Nên ghi rõ ngày nghỉ, lý do và tình trạng sức khỏe của con.",
    keywords: [
      "xin nghỉ",
      "nghỉ học",
      "ốm",
      "bị bệnh",
      "sick leave",
      "leave request",
      "absence",
      "nghi hoc",
      "con nghi",
      "bao nghi",
    ],
  },
  {
    id: "password",
    category: "Tài khoản",
    question: "Quên mật khẩu thì làm gì?",
    label: "mật khẩu",
    icon: "🔑",
    answer: "Dạ, hãy dùng chức năng Quên mật khẩu ở màn hình đăng nhập để nhận link đặt lại qua email.",
    path: ["Đăng nhập", "Quên mật khẩu", "Nhập email", "Kiểm tra hộp thư"],
    note: "Nếu là tài khoản học sinh không có email, hãy liên hệ bộ phận hỗ trợ để cấp lại.",
    keywords: [
      "quên mật khẩu",
      "mất mật khẩu",
      "đổi mật khẩu",
      "không đăng nhập",
      "bị khóa",
      "forgot password",
      "reset password",
      "locked out",
      "password gone",
      "mat pass",
      "quen mk",
      "khong vao duoc",
    ],
  },
  {
    id: "profile",
    category: "Tài khoản",
    question: "Cập nhật số điện thoại hoặc email ở đâu?",
    label: "thông tin cá nhân",
    icon: "🛠️",
    answer: "Dạ, phụ huynh có thể cập nhật số điện thoại và email trong phần cài đặt tài khoản.",
    path: ["Tài khoản", "Cài đặt tài khoản", "Cập nhật thông tin"],
    note: "Sau khi lưu, tải lại trang nếu thông tin chưa hiển thị ngay.",
    keywords: [
      "cập nhật thông tin",
      "số điện thoại",
      "email",
      "thông tin cá nhân",
      "đổi số",
      "change phone",
      "phone number",
      "linked phone",
      "account settings",
      "personal info",
    ],
  },
  {
    id: "schedule",
    category: "Lịch học",
    question: "Xem lịch học ở đâu?",
    label: "lịch học",
    icon: "📅",
    answer: "Dạ, phụ huynh mở mục Lịch học để xem thời khóa biểu theo ngày hoặc theo tuần.",
    path: ["Lịch học", "Chọn con", "Chọn tuần cần xem"],
    note: "Nếu lớp vừa đổi lịch, hãy bấm tải lại trang để lấy dữ liệu mới nhất.",
    keywords: [
      "lịch học",
      "thời khóa biểu",
      "tkb",
      "schedule",
      "timetable",
      "class schedule",
      "tuần này học gì",
      "hoc mon gi",
      "where is class",
    ],
  },
  {
    id: "exam",
    category: "Lịch thi",
    question: "Xem lịch thi ở đâu?",
    label: "lịch thi",
    icon: "📅",
    answer: "Dạ, lịch thi thường được cập nhật trong phần Thông báo hoặc Lịch học tập.",
    path: ["Thông báo", "Lịch thi / Lịch học tập", "Chọn học kỳ"],
    note: "Nên kiểm tra lại gần ngày thi vì lịch có thể được nhà trường cập nhật.",
    keywords: [
      "lịch thi",
      "kỳ thi",
      "kiểm tra",
      "exam",
      "exam schedule",
      "test schedule",
      "this week exam",
      "thi tuần này",
      "lich kiem tra",
    ],
  },
  {
    id: "homeroom",
    category: "Liên hệ nhà trường",
    question: "Nhắn giáo viên chủ nhiệm ở đâu?",
    label: "liên hệ giáo viên chủ nhiệm",
    icon: "💬",
    answer: "Dạ, phụ huynh vào mục liên hệ giáo viên chủ nhiệm và chọn đúng cuộc trò chuyện.",
    path: ["Trò chuyện", "Giáo viên chủ nhiệm", "Chọn giáo viên", "Gửi tin nhắn"],
    note: "Nếu chưa thấy giáo viên, kiểm tra con đang chọn đúng lớp hiện tại.",
    keywords: [
      "giáo viên chủ nhiệm",
      "gvcn",
      "nhắn giáo viên",
      "liên hệ giáo viên",
      "homeroom teacher",
      "message teacher",
      "contact teacher",
      "chat teacher",
      "co giao chu nhiem",
      "thay co",
    ],
  },
  {
    id: "notification",
    category: "Thông báo",
    question: "Thông báo chưa đọc không cập nhật thì làm gì?",
    label: "đồng bộ thông báo",
    icon: "🔔",
    answer: "Dạ, đây thường là vấn đề đồng bộ tạm thời. Phụ huynh hãy tải lại trang để cập nhật số thông báo chưa đọc.",
    path: ["Nhấn F5", "Mở Thông báo", "Kiểm tra lại số chưa đọc"],
    note: "Nếu vẫn không đổi sau khi tải lại, đăng xuất rồi đăng nhập lại để làm mới phiên.",
    keywords: [
      "thông báo",
      "chưa đọc",
      "không cập nhật",
      "notification",
      "unread",
      "not update",
      "sync error",
      "đồng bộ",
      "f5",
      "refresh",
    ],
  },
];

const LOCAL_FAQS = SUPPORT_INTENTS.map(({ id, category, question, answer, note, keywords }) => ({
  id: `support-${id}`,
  category,
  question,
  answer: `${answer} ${note}`,
  keywords,
}));

const QUICK_ACTION_GROUPS = [
  {
    category: "Học tập",
    actions: [
      "📊 Xem điểm của con ở đâu?",
      "📅 Lịch thi tuần này xem ở đâu?",
    ],
  },
  {
    category: "Học phí",
    actions: [
      "💰 Hướng dẫn đóng học phí",
      "💸 Kiểm tra học phí còn nợ",
    ],
  },
  {
    category: "Tài khoản",
    actions: [
      "🔑 Tôi quên mật khẩu",
      "🛠️ Đổi số điện thoại liên kết",
    ],
  },
  {
    category: "Liên hệ",
    actions: [
      "📝 Xin nghỉ học cho con",
      "💬 Nhắn giáo viên chủ nhiệm",
    ],
  },
];

const TECHNICAL_HINTS = [
  "bug",
  "error",
  "failed",
  "crash",
  "không chạy",
  "khong chay",
  "không hiện",
  "khong hien",
  "không thấy",
  "khong thay",
  "không gửi",
  "khong gui",
  "không vào được",
  "khong vao duoc",
  "404",
  "500",
  "400",
  "axios",
  "api",
  "server",
  "màn hình trắng",
  "man hinh trang",
  "văng ra",
  "vang ra",
];

const createTicketDraft = (message) => {
  const cleanMessage = message.replace(/\s+/g, " ").trim();
  const normalized = normalizeText(cleanMessage);
  const isTechnical = TECHNICAL_HINTS.some((hint) => normalized.includes(normalizeText(hint)));
  const clipped = cleanMessage.length > 92 ? `${cleanMessage.slice(0, 89)}...` : cleanMessage;

  return {
    category: isTechnical ? "technical" : "support",
    priority: isTechnical ? "high" : "medium",
    subject: isTechnical
      ? `Lỗi cần kiểm tra: ${clipped}`
      : `Yêu cầu hỗ trợ: ${clipped}`,
    content: [
      "Phụ huynh cần hỗ trợ ngoài danh sách FAQ của Trung tâm hỗ trợ.",
      "",
      `Nội dung phụ huynh nhập: ${cleanMessage}`,
      "",
      "Vui lòng kiểm tra và phản hồi cho phụ huynh trong hệ thống LMS.",
    ].join("\n"),
  };
};

export default function ParentSupport() {
  const [faqSearch, setFaqSearch] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      role: "bot",
      text: "Xin chào phụ huynh! Tôi là trợ lý LMS. Bạn có thể hỏi tự nhiên như “con tôi học sao rồi?”, “quên mật khẩu”, “đóng học phí ở đâu” hoặc chọn nhanh bên dưới.",
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [sendingTicketId, setSendingTicketId] = useState(null);
  const chatBodyRef = useRef(null);

  // Fetch FAQs from API
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await parentService.listFaqs({ mock: false });
        if (res?.success && Array.isArray(res.data)) {
          setFaqs(res.data);
        }
      } catch (err) {
        console.error("Error fetching FAQs:", err);
        setFaqs([]);
      } finally {
        setFaqLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const searchSupportIntent = (query) => {
    const normalizedQuery = normalizeText(query);
    const queryWords = normalizedQuery.split(/\s+/).filter((word) => word.length > 2);

    const scored = SUPPORT_INTENTS.map((intent) => {
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
        const normalizedKeyword = normalizeText(keyword);
        if (!normalizedKeyword) continue;

        if (normalizedQuery === normalizedKeyword) {
          score += 12;
        } else if (normalizedQuery.includes(normalizedKeyword)) {
          score += normalizedKeyword.length > 5 ? 8 : 4;
        } else if (normalizedKeyword.includes(normalizedQuery) && normalizedQuery.length > 3) {
          score += 4;
        }
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
    const path = intent.path?.length ? `${intent.icon} ${intent.path.join(" ➡️ ")}` : "";
    return [
      `Dạ, em hiểu phụ huynh đang hỏi về ${intent.label}.`,
      intent.answer,
      path,
      intent.note,
    ].filter(Boolean).join("\n");
  };

  const buildFallbackResponse = () => {
    return [
      "Dạ, vấn đề này hơi khác với các hướng dẫn có sẵn.",
      "Em đã soạn sẵn một ticket ngắn gọn bên dưới. Phụ huynh chỉ cần bấm “Gửi ticket” để chuyển trực tiếp cho bộ phận kỹ thuật/nhà trường xử lý.",
    ].join("\n");
  };

  const handleSendTicket = async (messageId, draft) => {
    if (!draft || sendingTicketId) return;

    setSendingTicketId(messageId);

    try {
      const response = await parentService.submitSupportTicket({
        mock: false,
        body: {
          category: draft.category,
          subject: draft.subject,
          content: draft.content,
          priority: draft.priority,
        },
      });

      const ticketNo = response?.data?.ticket_no || response?.data?.ticketNo;

      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                ticketStatus: "sent",
                ticketNo,
              }
            : msg,
        ),
      );

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "bot",
          text: ticketNo
            ? `Đã gửi ticket ${ticketNo} cho bộ phận hỗ trợ. Phụ huynh có thể theo dõi phản hồi trong Trung tâm hỗ trợ.`
            : "Đã gửi ticket cho bộ phận hỗ trợ. Phụ huynh có thể theo dõi phản hồi trong Trung tâm hỗ trợ.",
          category: "Ticket hỗ trợ",
          time: formatTime(),
        },
      ]);
    } catch (error) {
      console.error("Error sending support ticket:", error);
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                ticketStatus: "error",
              }
            : msg,
        ),
      );
    } finally {
      setSendingTicketId(null);
    }
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const handleSendMessage = async (presetMessage) => {
    const message = (presetMessage ?? inputValue).trim();
    if (!message) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: message,
      time: formatTime(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    setShowQuickActions(false);

    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

    const matchedIntent = searchSupportIntent(message);
    const apiFaq = matchedIntent ? null : searchApiFaq(message);

    let botResponse;
    if (matchedIntent) {
      botResponse = {
        id: Date.now() + 1,
        role: "bot",
        text: buildIntentResponse(matchedIntent),
        category: matchedIntent.category,
        relatedQuestion: matchedIntent.question,
        time: formatTime(),
      };
    } else if (apiFaq) {
      botResponse = {
        id: Date.now() + 1,
        role: "bot",
        text: apiFaq.answer || apiFaq.content || "Không có câu trả lời.",
        category: apiFaq.category,
        relatedQuestion: apiFaq.question || apiFaq.title,
        time: formatTime(),
      };
    } else {
      botResponse = {
        id: Date.now() + 1,
        role: "bot",
        text: buildFallbackResponse(),
        ticketDraft: createTicketDraft(message),
        ticketStatus: "draft",
        time: formatTime(),
      };
    }

    setIsTyping(false);
    setChatMessages((prev) => [...prev, botResponse]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const apiFaqs = faqs.map((faq) => ({ ...faq, id: faq.id ?? `${faq.category}-${faq.question}` }));
  const displayFaqs = [...LOCAL_FAQS, ...apiFaqs];

  const sortedFaqs = [...displayFaqs].sort((a, b) => (b.keywords?.length || 0) - (a.keywords?.length || 0));
  const normalizedKeyword = normalizeText(faqSearch);

  const filteredFaqs = sortedFaqs.filter((faq) => {
    if (!normalizedKeyword) return true;

    const content = normalizeText(`${faq.category || ""} ${faq.question || faq.title || ""} ${faq.answer || faq.content || ""} ${(faq.keywords || []).join(" ")}`);
    return content.includes(normalizedKeyword);
  });

  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    const cat = faq.category || "Khác";
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(faq);
    return acc;
  }, {});

  return (
    <div className="parent-support-page">
      <SupportHeader
        faqCount={faqLoading ? "..." : filteredFaqs.length}
        chatStatus="Hoạt động"
      />

      <div className="parent-support-container">
        <FAQList
          groupedFaqs={groupedFaqs}
          keyword={faqSearch}
          onKeywordChange={setFaqSearch}
        />

        <div className="parent-support-chat">
          <div className="parent-chat-header">
            <h4>
              <FaRobot /> Trợ lý LMS
            </h4>

            <span className="parent-chat-status">
              <FaRegClock /> Trực tuyến
            </span>
          </div>

          <div className="parent-chat-body" ref={chatBodyRef}>
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`parent-chat-message ${msg.role === "bot" ? "is-bot" : "is-user"}`}
              >
                <div className="parent-chat-role">
                  {msg.role === "bot" ? "Bot" : "Bạn"}
                </div>
                <div className="parent-chat-content">
                  {msg.text.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.text.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </div>
                {msg.category && (
                  <div className="parent-chat-category">
                    Chủ đề: {msg.category}
                  </div>
                )}
                {msg.relatedQuestion && (
                  <div className="parent-chat-related">
                    Câu hỏi liên quan: {msg.relatedQuestion}
                  </div>
                )}
                {msg.ticketDraft && (
                  <div className="parent-ticket-draft">
                    <div className="parent-ticket-draft-header">
                      <FaTicketAlt />
                      <span>Ticket nháp</span>
                    </div>
                    <div className="parent-ticket-draft-field">
                      <span>Tiêu đề</span>
                      <strong>{msg.ticketDraft.subject}</strong>
                    </div>
                    <div className="parent-ticket-draft-field">
                      <span>Mô tả</span>
                      <p>{msg.ticketDraft.content}</p>
                    </div>
                    <div className="parent-ticket-draft-actions">
                      {msg.ticketStatus === "sent" ? (
                        <span className="parent-ticket-status is-sent">
                          Đã gửi{msg.ticketNo ? `: ${msg.ticketNo}` : ""}
                        </span>
                      ) : msg.ticketStatus === "error" ? (
                        <>
                          <span className="parent-ticket-status is-error">
                            Gửi ticket thất bại. Vui lòng thử lại.
                          </span>
                          <button type="button" onClick={() => handleSendTicket(msg.id, msg.ticketDraft)}>
                            Gửi lại
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSendTicket(msg.id, msg.ticketDraft)}
                          disabled={sendingTicketId === msg.id}
                        >
                          {sendingTicketId === msg.id ? "Đang gửi..." : "Gửi ticket"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <div className="parent-chat-time">{msg.time}</div>
              </div>
            ))}

            {isTyping && (
              <div className="parent-chat-message is-bot">
                <div className="parent-chat-role">Bot</div>
                <div className="parent-chat-typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          {showQuickActions && (
            <div className="parent-chat-quick-actions">
              <span className="quick-action-label">Chọn nhanh:</span>
              {QUICK_ACTION_GROUPS.map((group) => (
                <div className="quick-action-group" key={group.category}>
                  <span className="quick-action-group-title">{group.category}</span>
                  <div className="quick-action-buttons">
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

          <div className="parent-chat-input">
            <input
              type="text"
              placeholder="Nhập câu hỏi cần hỗ trợ..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              type="button"
              aria-label="Gửi tin nhắn"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>

      <footer className="parent-support-footer">
        <SupportContact />
      </footer>
    </div>
  );
}
