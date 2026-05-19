import { useEffect, useRef, useState } from "react";
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
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Chatbot State
  const [messages, setMessages] = useState([
    {
      id: "init",
      role: "assistant",
      content: "Xin chào! Tôi là trợ lý LMS dành cho giáo viên. Bạn cần hỗ trợ vấn đề nào trong công tác giảng dạy?",
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

  // Auto-scroll chat body on new messages
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
    setMessages((prev) => [...prev, userMsg]);
    const botMsgId = `bot-${Date.now()}`;
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

      // Add the empty bot message to prepare for streaming chunks
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          role: "assistant",
          content: "",
          time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);

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
                    msg.id === botMsgId ? { ...msg, content: botResponseText } : msg
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
      setMessages((prev) => {
        const botMsgExists = prev.some((m) => m.id === botMsgId);
        if (botMsgExists) {
          return prev.map((msg) =>
            msg.id === botMsgId
              ? {
                  ...msg,
                  content: "Xin lỗi, tôi gặp sự cố kết nối với hệ thống AI. Vui lòng thử lại sau.",
                  isError: true,
                }
              : msg
          );
        } else {
          return [
            ...prev,
            {
              id: `err-${Date.now()}`,
              role: "assistant",
              content: "Xin lỗi, tôi gặp sự cố kết nối với hệ thống AI. Vui lòng thử lại sau.",
              time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
              isError: true,
            },
          ];
        }
      });
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

          <div className="teacher-chat-body" ref={chatBodyRef}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`teacher-chat-message ${msg.role === "assistant" ? "is-bot" : "is-user"} ${msg.isError ? "is-error" : ""}`}
              >
                <div className="teacher-chat-role">
                  {msg.role === "assistant" ? "Bot" : "Bạn"}
                </div>
                {msg.content}
                <div className="teacher-chat-time">{msg.time}</div>
              </div>
            ))}
            {isSending && (
              <div className="teacher-chat-message is-bot typing">
                <div className="teacher-chat-role">Bot</div>
                Đang suy nghĩ...
              </div>
            )}
          </div>

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
              onClick={handleSendMessage}
              disabled={isSending}
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
