import { useState, useEffect, useCallback, useRef } from "react";
import "./ParentMessages.css";
import ConversationList from "./components/ConversationList/ConversationList";
import ChatWindow from "./components/ChatWindow/ChatWindow";
import { parentService } from "../../../services/pages/parent/parentService";
import { io } from "socket.io-client";
import { PageHeader } from "../../../components/common";

const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "/api/v1";
  if (apiUrl.startsWith("/")) {
    return window.location.origin;
  }
  return apiUrl.replace("/api/v1", "");
};

let socket = null;

const ParentMessages = () => {
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [teacherList, setTeacherList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  const selectedTeacherRef = useRef(null);
  const teacherListRef = useRef([]);

  // Keep refs updated to avoid stale closures in socket listener
  useEffect(() => {
    selectedTeacherRef.current = selectedTeacher;
  }, [selectedTeacher]);

  useEffect(() => {
    teacherListRef.current = teacherList;
  }, [teacherList]);

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
      const messages = msgs?.messages || msgs?.data || msgs || [];
      setMessages(Array.isArray(messages) ? messages : []);
    } catch (err) {
      console.error("❌ Error loading messages:", err);
      setMessages([]);
    }
  }, []);

  // Handle select teacher - auto create chat if conversationId doesn't exist
  const handleSelectTeacher = useCallback(async (teacher) => {
    setInputValue("");
    
    if (!teacher.conversationId) {
      setIsLoading(true);
      try {
        const res = await parentService.startHumanChat({
          body: { targetId: teacher.teacherUserId || teacher.teacherId },
          mock: false,
        });

        if (res?.success && res.data?.conversationId) {
          const newConvId = res.data.conversationId;
          const updatedTeacher = { ...teacher, conversationId: newConvId };

          // Update in list
          setTeacherList(prevList =>
            prevList.map(t =>
              t.teacherId === teacher.teacherId ? updatedTeacher : t
            )
          );

          setSelectedTeacher(updatedTeacher);
          loadMessages(updatedTeacher);

          // Join Socket room
          if (socket?.connected) {
            socket.emit("join_conversation", newConvId);
          }
          return;
        }
      } catch (err) {
        console.error("Failed to auto-create conversation with GVCN:", err);
      } finally {
        setIsLoading(false);
      }
    }

    setSelectedTeacher(teacher);
    loadMessages(teacher);
  }, [loadMessages]);

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

        // 3. Build teacher list with conversationId — DEDUPLICATE by teacherId
        // If multiple children share the same homeroom teacher, show ONE entry with all children
        const teacherMap = {};
        for (const t of teachers) {
          const teacherId = t.teacherUserId || t.teacherId;
          if (!teacherId) continue;
          if (!teacherMap[teacherId]) {
            teacherMap[teacherId] = {
              id: `teacher-${teacherId}`,
              teacherId: teacherId,
              teacherUserId: t.teacherUserId,
              name: t.teacherName || "Giáo viên chủ nhiệm",
              children: [],
              conversationId: convMap[teacherId] || null,
            };
          }
          teacherMap[teacherId].children.push({
            studentId: t.studentId,
            studentName: t.studentName,
            className: t.className,
          });
        }

        // If no conversationId yet, build className from the children
        const list = Object.values(teacherMap).map(t => ({
          ...t,
          className: t.children.map(c => c.className).filter(Boolean).join(", ") || "",
        }));

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
  }, [handleSelectTeacher]);

  // Connect Socket.IO client and listen to events
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const token = storedUser?.accessToken || localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || "";

    if (!token) return;

    if (socket) socket.disconnect();

    socket = io(getSocketUrl(), {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      setConnectionStatus("connected");
      console.log("Parent socket connected successfully");

      // Join rooms for all teachers that have conversationIds
      teacherListRef.current.forEach(t => {
        if (t.conversationId) {
          socket.emit("join_conversation", t.conversationId);
        }
      });
    });

    socket.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    socket.on("connect_error", (err) => {
      setConnectionStatus("error");
      console.error("Parent socket connection error:", err.message);
    });

    // Realtime message handler
    socket.on("new_message", ({ conversationId, message }) => {
      console.log("Parent socket: new_message received:", { conversationId, message });
      const activeTeacher = selectedTeacherRef.current;
      const currentUserIdStr = String(JSON.parse(localStorage.getItem("user") || "{}")?.id || "");
      const fromMe = String(message.user_id || message.senderId) === currentUserIdStr;

      // Update current active messages list
      if (activeTeacher && String(activeTeacher.conversationId) === String(conversationId)) {
        const formatted = {
          id: message.id || Date.now(),
          from: fromMe ? "me" : "other",
          user_id: message.user_id,
          role: message.role || (fromMe ? "parent" : "teacher"),
          content: message.content,
          text: message.content,
          createdAt: message.created_at || message.createdAt || new Date().toISOString(),
        };

        setMessages(prev => {
          if (prev.some(m => String(m.id) === String(formatted.id))) return prev;
          // Filter out matching optimistic message to avoid duplicate flicker
          const filtered = prev.filter(m => !(String(m.id).startsWith("temp-") || typeof m.id === "number") || m.content !== formatted.content);
          return [...filtered, formatted];
        });
      }

      // Update the teacher list metadata (lastMessage and unread)
      setTeacherList(prevList => {
        return prevList.map(t => {
          if (String(t.conversationId) === String(conversationId)) {
            const isActive = activeTeacher && String(activeTeacher.conversationId) === String(conversationId);
            return {
              ...t,
              lastMessage: message.content,
              unread: isActive ? 0 : (t.unread || 0) + 1,
            };
          }
          return t;
        });
      });
    });

    socket.on("message_deleted", ({ conversationId, messageId }) => {
      const activeTeacher = selectedTeacherRef.current;
      if (activeTeacher && String(activeTeacher.conversationId) === String(conversationId)) {
        setMessages(prev => prev.filter(m => String(m.id) !== String(messageId)));
      }
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  // When teacher list updates, ensure socket joins any newly added conversation rooms
  useEffect(() => {
    if (socket?.connected && teacherList.length > 0) {
      teacherList.forEach(t => {
        if (t.conversationId) {
          socket.emit("join_conversation", t.conversationId);
        }
      });
    }
  }, [teacherList]);

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
      // Optimistic update - no need to reload
    } catch (err) {
      console.error("Error sending message:", err);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!messageId || String(messageId).startsWith("temp-")) return;

    const previousMessages = messages;
    setMessages(prev => prev.filter(m => String(m.id) !== String(messageId)));

    try {
      const res = await parentService.deleteMessage({
        pathParams: { messageId },
        mock: false,
      });
      if (res && res.success === false) {
        setMessages(previousMessages);
      }
    } catch (err) {
      console.error("Error deleting message:", err);
      setMessages(previousMessages);
    }
  };

  return (
    <div className="parent-messages theme-parent">
      <PageHeader 
        title="Liên lạc giáo viên chủ nhiệm"
        eyebrow="Liên Lạc"
        description="Trao đổi nhanh với giáo viên chủ nhiệm về học tập, điểm danh và tình hình của con."
        actionRight={
          <span className={`connection-badge ${connectionStatus}`}>
            {connectionStatus === "connected" ? "● Live" : connectionStatus === "error" ? "⚠ Lỗi" : "○ Offline"}
          </span>
        }
      />

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
          onDeleteMessage={handleDeleteMessage}
          isSending={isSending}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
};

export default ParentMessages;
