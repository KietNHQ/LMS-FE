import { useEffect, useRef, useState } from "react";
import studentService from "../../../services/pages/student/studentService";
import "./StudentSupport.css";
import { FaPaperPlane, FaRegClock, FaRobot } from "react-icons/fa";
import FAQList from "./components/FAQList/FAQList";
import SupportContact from "./components/SupportContact/SupportContact";
import SupportHeader from "./components/SupportHeader/SupportHeader";

const STUDENT_DEFAULT_FAQS = [
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

export default function StudentSupport() {
  const [faqSearch, setFaqSearch] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: "init",
      role: "assistant",
      content: "Xin chào! Tôi là trợ lý LMS dành cho học sinh. Bạn cần hỗ trợ vấn đề nào?",
      time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);

  const chatBodyRef = useRef(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      setIsLoading(true);
      try {
        const response = await studentService.listFaqs({ mock: false });
        if (response.success && response.data?.length > 0) {
          setFaqs(response.data);
        } else {
          setFaqs(STUDENT_DEFAULT_FAQS);
        }
      } catch (error) {
        console.warn("Real FAQs API failed, using student mocks.");
        setFaqs(STUDENT_DEFAULT_FAQS);
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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    const userText = inputMessage.trim();
    setInputMessage("");
    setIsSending(true);

    const currentTime = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
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
      content: "Đang suy nghĩ...",
      isThinking: true,
      time: currentTime,
    };

    setMessages((prev) => [...prev, userMsg, initialBotMsg]);
    let botResponseText = "";

    try {
      const isPersistent = localStorage.getItem("isPersistent") === "true";
      const token = sessionStorage.getItem("accessToken") || (isPersistent ? localStorage.getItem("accessToken") : null);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userText,
          conversationId: conversationId || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Không thể kết nối với dịch vụ stream AI");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed === "data: [DONE]") continue;

          if (trimmed.startsWith("data: ")) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.type === "chunk" && data.content) {
                botResponseText += data.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMsgId ? { ...msg, content: botResponseText, isThinking: false } : msg
                  )
                );
              } else if (data.type === "conversationId" && data.conversationId) {
                setConversationId(data.conversationId);
              } else if (data.type === "error") {
                throw new Error(data.message);
              }
            } catch (e) {
              // Ignore incomplete JSON parses
            }
          }
        }
      }
    } catch (error) {
      console.error("AI Stream Error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? {
                ...msg,
                content: "Xin lỗi, tôi gặp sự cố kết nối với hệ thống AI. Vui lòng thử lại sau.",
                isError: true,
                isThinking: false,
              }
            : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

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

          <div className="student-chat-body" ref={chatBodyRef}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`student-chat-message ${msg.role === "assistant" ? "is-bot" : "is-user"} ${msg.isError ? "is-error" : ""} ${msg.isThinking ? "typing" : ""}`}
              >
                <div className="student-chat-role">
                  {msg.role === "assistant" ? "Bot" : "Bạn"}
                </div>
                {msg.content}
                <div className="student-chat-time">{msg.time}</div>
              </div>
            ))}
          </div>

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
              onClick={handleSendMessage}
              disabled={isSending}
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
