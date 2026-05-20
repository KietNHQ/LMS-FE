import "./ParentSupport.css";
import { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaRegClock, FaRobot, FaTimes } from "react-icons/fa";
import FAQList from "./components/FAQList/FAQList";
import SupportContact from "./components/SupportContact/SupportContact";
import SupportHeader from "./components/SupportHeader/SupportHeader";
import { parentService } from "../../../services/pages/parent/parentService";

const MOCK_FAQS = [
  {
    id: 1,
    category: "Học tập",
    question: "Làm sao để theo dõi kết quả học tập của con?",
    answer: "Bạn mở mục Tổng quan con em hoặc Điểm số để xem chi tiết theo học kỳ.",
    keywords: ["điểm", "học tập", "kết quả", "theo dõi", "điểm số"],
  },
];

export default function ParentSupport() {
  const [faqSearch, setFaqSearch] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      role: "bot",
      text: "Xin chào! Tôi là trợ lý LMS dành cho phụ huynh. Bạn cần hỗ trợ vấn đề nào? Tôi có thể giúp bạn tìm câu trả lời nhanh hoặc ghi nhận yêu cầu hỗ trợ.",
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
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
        setFaqs(MOCK_FAQS);
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

  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, (m) => (m === "đ" ? "d" : "D"));
  };

  const searchFaq = (query) => {
    const normalizedQuery = normalizeText(query);

    // Score each FAQ by keyword match
    const scored = faqs.map((faq) => {
      let score = 0;
      const questionNorm = normalizeText(faq.question || faq.title || "");
      const categoryNorm = normalizeText(faq.category || "");

      // Exact match in question
      if (questionNorm.includes(normalizedQuery)) score += 10;
      // Exact match in category
      if (categoryNorm.includes(normalizedQuery)) score += 5;
      // Keyword match
      const keywords = faq.keywords || [];
      for (const kw of keywords) {
        if (normalizeText(kw).includes(normalizedQuery) || normalizedQuery.includes(normalizeText(kw))) {
          score += 3;
        }
      }
      // Word overlap
      const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 2);
      for (const word of queryWords) {
        if (questionNorm.includes(word)) score += 1;
        if (categoryNorm.includes(word)) score += 0.5;
      }

      return { faq, score };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return scored.filter((s) => s.score > 0).slice(0, 3);
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  const handleSendMessage = async () => {
    const message = inputValue.trim();
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

    // Simulate bot thinking
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));

    const results = searchFaq(message);

    let botResponse;
    if (results.length > 0) {
      const topResult = results[0];
      botResponse = {
        id: Date.now() + 1,
        role: "bot",
        text: topResult.faq.answer || topResult.faq.content || "Không có câu trả lời.",
        category: topResult.faq.category,
        relatedQuestion: topResult.faq.question || topResult.faq.title,
        time: formatTime(),
      };
    } else {
      botResponse = {
        id: Date.now() + 1,
        role: "bot",
        text: `Xin lỗi, tôi chưa tìm thấy câu trả lời phù hợp cho "${message}". Bạn có thể:\n\n1. Thử diễn đạt lại câu hỏi\n2. Liên hệ trực tiếp qua thông tin bên dưới\n3. Gửi yêu cầu hỗ trợ để được giải đáp`,
        time: formatTime(),
        showContact: true,
      };
    }

    setIsTyping(false);
    setChatMessages((prev) => [...prev, botResponse]);
  };

  const handleQuickAction = async (question) => {
    setInputValue(question);
    await new Promise((resolve) => setTimeout(resolve, 100));
    handleSendMessage();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Use API FAQs or fallback to MOCK_FAQS
  const displayFaqs = faqs.length > 0 ? faqs : MOCK_FAQS;

  const sortedFaqs = [...displayFaqs].sort((a, b) => (b.keywords?.length || 0) - (a.keywords?.length || 0));
  const normalizedKeyword = faqSearch.trim().toLowerCase();

  const filteredFaqs = sortedFaqs.filter((faq) => {
    if (!normalizedKeyword) return true;

    const content = `${faq.category || ""} ${faq.question || faq.title || ""} ${faq.answer || faq.content || ""}`.toLowerCase();
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
              <span className="quick-action-label">Nhanh chóng:</span>
              <button onClick={() => handleQuickAction("Xem điểm của con")}>
                Xem điểm
              </button>
              <button onClick={() => handleQuickAction("Thanh toán học phí")}>
                Thanh toán
              </button>
              <button onClick={() => handleQuickAction("Liên hệ giáo viên")}>
                Liên hệ GVCN
              </button>
              <button onClick={() => handleQuickAction("Lịch điểm danh")}>
                Điểm danh
              </button>
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
