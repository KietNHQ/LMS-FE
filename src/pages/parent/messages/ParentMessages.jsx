import { useState, useEffect, useCallback } from "react";
import "./ParentMessages.css";
import ConversationList from "./components/ConversationList/ConversationList";
import ChatWindow from "./components/ChatWindow/ChatWindow";
import { parentService } from "../../../services/pages/parent/parentService";

const ParentMessages = () => {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user ID from localStorage/sessionStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserId(user?.id);
      } catch (e) {
        console.error("Failed to parse user:", e);
      }
    }
  }, []);

  // Fetch teachers + conversations on mount
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      try {
        // 1. Get teachers with their children
        const teachersRes = await parentService.getTeachers({ mock: false });
        // Axios interceptor unwraps response.data, so teachersRes = { success, data: [...] }
        let teachers = [];
        if (teachersRes) {
          if (Array.isArray(teachersRes)) {
            teachers = teachersRes;
          } else if (teachersRes.data && Array.isArray(teachersRes.data)) {
            teachers = teachersRes.data;
          } else if (teachersRes.success && teachersRes.data) {
            teachers = teachersRes.data;
          }
        }

        // 2. Get existing conversations
        const convsRes = await parentService.listMessages({ mock: false });
        let convs = [];
        if (convsRes) {
          if (Array.isArray(convsRes)) {
            convs = convsRes;
          } else if (convsRes.conversations && Array.isArray(convsRes.conversations)) {
            convs = convsRes.conversations;
          } else if (convsRes.data && Array.isArray(convsRes.data)) {
            convs = convsRes.data;
          }
        }

        // Map conversationId to teacherId
        const convMap = {};
        for (const conv of convs) {
          const teacherId = conv.otherParticipant?.id || conv.other_user_id || conv.userId;
          if (teacherId) {
            convMap[teacherId] = conv.id;
          }
        }

        // 3. Build teacher list with conversationId
        const list = teachers.map(t => {
          const teacherId = t.teacherUserId || t.teacherId;
          return {
            id: `teacher-${teacherId}`,
            teacherId: teacherId,
            teacherUserId: t.teacherUserId,
            name: t.teacherName || "Giáo viên chủ nhiệm",
            className: t.classNames?.[0] || t.className || "",
            children: t.children || [],
            conversationId: convMap[teacherId] || null,
          };
        });

        if (!isMounted) return;
        setTeacherList(list);

        // Auto-select first teacher if exists and has conversation
        const firstWithConv = list.find(t => t.conversationId);
        if (firstWithConv) {
          handleSelectTeacher(firstWithConv);
        }
      } catch (err) {
        console.error("Error fetching teachers:", err);
        if (isMounted) setTeacherList([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load messages when teacher is selected
  const loadMessages = useCallback(async (teacher) => {
    console.log("🔄 loadMessages called with teacher:", teacher);
    console.log("🔄 conversationId:", teacher?.conversationId);

    if (!teacher?.conversationId) {
      console.log("❌ No conversationId, skipping message load");
      setMessages([]);
      return;
    }

    try {
      console.log("📡 Calling getMessagesHistory for:", teacher.conversationId);
      const msgs = await parentService.getMessagesHistory({
        pathParams: { conversationId: teacher.conversationId },
        mock: false,
      });
      console.log("📨 getMessagesHistory response:", msgs);
      // Response: {success, messages: [...], pagination}
      const messages = msgs?.messages || msgs?.data || msgs || [];
      console.log("📝 Parsed messages:", messages);
      setMessages(Array.isArray(messages) ? messages : []);
    } catch (err) {
      console.error("❌ Error loading messages:", err);
      setMessages([]);
    }
  }, []);

  const handleSelectTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setInputValue("");
    loadMessages(teacher);
  };

  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!selectedTeacher || !text) return;

    if (!selectedTeacher.conversationId) {
      alert("Chưa có cuộc trò chuyện với giáo viên này.");
      return;
    }

    setIsSending(true);

    const tempId = Date.now();
    const optimisticMsg = {
      id: tempId,
      from: "me",
      user_id: currentUserId,
      role: "parent",
      content: text,
      text: text,
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setInputValue("");

    try {
      await parentService.sendMessage({
        body: {
          conversationId: selectedTeacher.conversationId,
          message: text,
        },
        mock: false,
      });
      loadMessages(selectedTeacher);
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="parent-messages">
      <div className="parent-messages-header">
        <h1>Liên lạc giáo viên chủ nhiệm</h1>
        <p>Trao đổi nhanh với giáo viên chủ nhiệm về học tập, điểm danh và tình hình của con.</p>
      </div>

      <div className="messages-layout">
        <ConversationList
          teacherList={teacherList}
          selectedTeacher={selectedTeacher}
          onSelect={handleSelectTeacher}
          isLoading={isLoading}
        />

        <ChatWindow
          teacher={selectedTeacher}
          messages={messages}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSendMessage}
          isSending={isSending}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
};

export default ParentMessages;
