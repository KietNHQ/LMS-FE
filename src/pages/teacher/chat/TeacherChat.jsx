import React, { useState, useMemo, useEffect, useRef } from "react";
import { FiSearch, FiSend, FiUsers, FiMessageSquare, FiHash, FiInfo } from "react-icons/fi";
import { homeroomData } from "../homeroom/data/homeroomData";
import { teacherService } from "../../../services/pages/teacher/teacherService";
import { io } from "socket.io-client";
import "./TeacherChat.css";

const getSocketUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
    return apiUrl.replace("/api/v1", "");
};

let socket = null;

const MOCK_DEPT_TEACHERS = [
    { id: "t1", name: "Thầy Nguyễn Văn An", role: "Tổ trưởng", status: "online" },
    { id: "t2", name: "Cô Trần Thị Bình", role: "Giáo viên", status: "offline" },
    { id: "t3", name: "Thầy Lê Văn Cường", role: "Giáo viên", status: "online" },
    { id: "t4", name: "Cô Phạm Thu Hà", role: "Giáo viên", status: "online" },
];

// Group messages by date, insert date separators
const groupMessagesByDate = (messages) => {
    const groups = [];
    let lastDate = null;
    for (const msg of messages) {
        const d = new Date(msg.createdAt || msg._rawDate || Date.now());
        const dateKey = d.toDateString();
        if (dateKey !== lastDate) {
            const today = new Date().toDateString();
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            let label;
            if (dateKey === today) label = "Hôm nay";
            else if (dateKey === yesterday) label = "Hôm qua";
            else label = d.toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" });
            groups.push({ type: "date", label, key: `date-${dateKey}` });
            lastDate = dateKey;
        }
        groups.push({ type: "message", ...msg });
    }
    return groups;
};

export default function TeacherChat() {
    const [activeRoomId, setActiveRoomId] = useState("homeroom");
    const [selectedTarget, setSelectedTarget] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [inputValue, setInputValue] = useState("");
    // Key messages by conversationId so real-time events route correctly
    const [messagesByConv, setMessagesByConv] = useState({});
    const [apiContacts, setApiContacts] = useState([]);
    // Map conversationId → target info for routing new_message events (ref for socket handler closure)
    const [convIdToTarget, setConvIdToTarget] = useState({});
    const convIdToTargetRef = useRef({});
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState("disconnected");
    const messagesEndRef = useRef(null);

    const getToken = () => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        return storedUser?.accessToken || localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") || "";
    };
    const getUserId = () => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        return storedUser?.id || "";
    };

    const activeRoom = useMemo(() => [
        { id: "homeroom", name: "Lớp Chủ Nhiệm", label: "Phụ huynh" },
        { id: "department", name: "Bộ Môn", label: "Đồng nghiệp" },
        { id: "technical", name: "Hỗ trợ", label: "Kỹ thuật" },
    ].find(r => r.id === activeRoomId), [activeRoomId]);

    const targets = useMemo(() => {
        if (apiContacts.length > 0) {
            if (activeRoomId === "homeroom") {
                return apiContacts.map(c => ({
                    id: c.parent_id,
                    name: c.parent_name,
                    subLabel: `PH em: ${c.student_name} (${c.class_name})`,
                    avatar: (c.parent_name || "PH").charAt(0),
                    type: "parent"
                }));
            }
        }
        if (activeRoomId === "homeroom") {
            return (homeroomData.students || []).map(s => ({
                id: `parent-${s.id}`,
                name: s.parentName,
                subLabel: `PH em: ${s.name}`,
                avatar: s.parentName.charAt(0),
                type: "parent"
            }));
        }
        if (activeRoomId === "department") {
            return MOCK_DEPT_TEACHERS.map(t => ({
                id: `teacher-${t.id}`,
                name: t.name,
                subLabel: t.role,
                avatar: t.name.charAt(6),
                type: "teacher",
                status: t.status
            }));
        }
        return [
            { id: "admin-support", name: "Quản trị viên Hệ thống", subLabel: "Hỗ trợ 24/7", avatar: "A", type: "admin" }
        ];
    }, [activeRoomId, apiContacts]);

    const filteredTargets = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return targets;
        return targets.filter(t =>
            t.name.toLowerCase().includes(query) ||
            (t.subLabel && t.subLabel.toLowerCase().includes(query))
        );
    }, [targets, searchQuery]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedTarget, messagesByConv]);

    // Mount: fetch contacts + existing conversations, connect socket
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch existing conversations so we can join their socket rooms
                const convRes = await teacherService.getHumanConversations({ mock: false });
                if (convRes?.data && convRes.data.length > 0) {
                    // Build convIdToTarget from existing conversations
                    const initMap = {};
                    for (const conv of convRes.data) {
                        const convId = conv.id;
                        const otherId = conv.other_user_id;
                        const otherName = conv.other_full_name || "Phụ huynh";
                        initMap[`conv-${convId}`] = {
                            targetId: otherId,
                            targetName: otherName,
                            subLabel: "",
                            type: "parent",
                        };
                    }
                    setConvIdToTarget(initMap);
                    convIdToTargetRef.current = initMap;
                }

                // Also fetch contacts for the target list UI
                const response = await teacherService.getChatContacts({ mock: false });
                if (response.success && response.data) {
                    setApiContacts(response.data);
                }
            } catch (err) {
                console.warn("Chat data fetch failed:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();

        // Connect socket
        const token = getToken();
        if (!token) return () => {};
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
            console.log("Teacher socket connected");
            // Join all known conversation rooms
            Object.keys(convIdToTargetRef.current).forEach(convId => {
                if (convId.startsWith("conv-")) {
                    socket.emit("join_conversation", convId.replace("conv-", ""));
                }
            });
        });

        socket.on("disconnect", () => setConnectionStatus("disconnected"));
        socket.on("connect_error", (err) => {
            setConnectionStatus("error");
            console.error("Teacher socket error:", err.message);
        });

        // Real-time: parent sent message → route to correct conversation by convId
        socket.on("new_message", ({ conversationId, message }) => {
            const targetInfo = convIdToTargetRef.current[`conv-${conversationId}`];
            if (!targetInfo) {
                console.log("Teacher: new_message for unknown convId:", conversationId);
                return;
            }
            const myId = getUserId();
            const fromMe = String(message.senderId) === String(myId);
            const formatted = {
                id: String(message.id),
                text: message.content,
                from: fromMe ? "me" : "other",
                senderName: message.senderName || (fromMe ? "Tôi" : targetInfo.targetName || "Phụ huynh"),
                createdAt: message.created_at || message.timestamp,
                time: new Date(message.created_at || message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            setMessagesByConv(prev => {
                const existing = prev[conversationId] || [];
                const exists = existing.some(m => String(m.id) === String(message.id));
                if (exists) return prev;
                return { ...prev, [conversationId]: [...existing, formatted] };
            });
        });

        return () => {
            if (socket) { socket.disconnect(); socket = null; }
        };
    }, []); // run once on mount

    // Keep ref in sync with convIdToTarget state
    useEffect(() => {
        convIdToTargetRef.current = convIdToTarget;
    }, [convIdToTarget]);

    // Reset target when room changes
    useEffect(() => {
        setSelectedTarget(null);
        setSearchQuery("");
    }, [activeRoomId]);

    // When target is selected: get or create conversation + join socket room
    useEffect(() => {
        if (!selectedTarget) {
            setActiveConversationId(null);
            return;
        }

        if (selectedTarget.type === "parent") {
            const getOrCreateConversation = async () => {
                try {
                    const response = await teacherService.startHumanChat({
                        body: { targetId: selectedTarget.id },
                        mock: false
                    });
                    if (response.success && response.data?.conversationId) {
                        const convId = response.data.conversationId;
                        setActiveConversationId(convId);
                        // Map convId → target info for routing new_message events
                        setConvIdToTarget(prev => {
                            const next = {
                                ...prev,
                                [`conv-${convId}`]: {
                                    targetId: selectedTarget.id,
                                    targetName: selectedTarget.name,
                                    subLabel: selectedTarget.subLabel,
                                    type: selectedTarget.type,
                                }
                            };
                            convIdToTargetRef.current = next;
                            return next;
                        });
                        // Join socket room immediately
                        if (socket?.connected) {
                            socket.emit("join_conversation", convId);
                        }
                        // Load existing messages
                        loadMessagesForConv(convId, selectedTarget.id);
                    }
                } catch (err) {
                    console.error("Failed to get/start human conversation:", err);
                }
            };
            getOrCreateConversation();
        } else {
            setActiveConversationId(`mock-${selectedTarget.id}`);
        }
    }, [selectedTarget]);

    const loadMessagesForConv = async (convId, targetId) => {
        try {
            const response = await teacherService.getHumanMessages({
                mock: false,
                pathParams: { conversationId: convId }
            });
            if (response.success && response.messages) {
                const mapped = response.messages
                    .map(m => ({
                        id: String(m.id),
                        text: m.content,
                        from: String(m.user_id) === String(targetId) ? "other" : "me",
                        senderName: m.user_full_name || (String(m.user_id) === String(targetId) ? selectedTarget?.name : "Tôi"),
                        createdAt: m.created_at,
                        time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }))
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

                setMessagesByConv(prev => ({ ...prev, [convId]: mapped }));
            }
        } catch (err) {
            console.error("Failed to load messages:", err);
        }
    };

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        const text = inputValue.trim();
        if (!selectedTarget || !text || !activeConversationId) return;

        const tempId = `temp-${Date.now()}`;
        const optimisticMessage = {
            id: tempId,
            text,
            from: "me",
            senderName: "Tôi",
            createdAt: new Date().toISOString(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Update UI optimistically
        setMessagesByConv(prev => ({
            ...prev,
            [activeConversationId]: [...(prev[activeConversationId] || []), optimisticMessage]
        }));
        setInputValue("");

        try {
            await teacherService.sendHumanMessage({
                mock: false,
                body: { conversationId: activeConversationId, message: text }
            });
            // Backend emits new_message to room via io.to() — no need to manually emit
        } catch (err) {
            console.error("Failed to send message:", err);
            // Remove optimistic message on failure
            setMessagesByConv(prev => ({
                ...prev,
                [activeConversationId]: (prev[activeConversationId] || []).filter(m => m.id !== tempId)
            }));
        }
    };

    const currentMessages = activeConversationId
        ? (messagesByConv[activeConversationId] || [])
        : [];

    return (
        <div className="teacher-chat-page">
            <div className="teacher-chat-container">
                {/* 1. Target List & Room Tabs */}
                <div className="chat-target-list-wrapper">
                    <div className="chat-room-tabs">
                        {[
                            { id: "homeroom", label: "Phụ huynh" },
                            { id: "department", label: "Đồng nghiệp" },
                            { id: "technical", label: "Kỹ thuật" },
                        ].map(room => (
                            <button
                                key={room.id}
                                className={`room-tab ${activeRoomId === room.id ? 'active' : ''}`}
                                onClick={() => setActiveRoomId(room.id)}
                            >
                                {room.label}
                            </button>
                        ))}
                    </div>

                    <div className="target-search">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm liên hệ..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="target-list-items custom-scroll">
                        {isLoading ? (
                            <div style={{ padding: 16, textAlign: "center", color: "#999" }}>Đang tải...</div>
                        ) : filteredTargets.length === 0 ? (
                            <div style={{ padding: 16, textAlign: "center", color: "#999" }}>Không có liên hệ</div>
                        ) : (
                            filteredTargets.map(target => (
                                <div
                                    key={target.id}
                                    className={`target-item ${selectedTarget?.id === target.id ? 'active' : ''}`}
                                    onClick={() => setSelectedTarget(target)}
                                >
                                    <div className={`target-avatar ${target.type}`}>
                                        {target.avatar}
                                        {target.status === 'online' && <span className="status-dot"></span>}
                                    </div>
                                    <div className="target-info">
                                        <span className="target-name">{target.name}</span>
                                        <span className="target-sub">{target.subLabel}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 2. Main Chat Area */}
                <div className="chat-main-area">
                    <div className="chat-main-header">
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                                <h2>{activeRoom?.name || "Liên lạc"}</h2>
                                <p>{activeRoomId === 'homeroom' ? 'Trao đổi với phụ huynh học sinh' : 'Thảo luận nội bộ trường học'}</p>
                            </div>
                            <span className={`connection-badge ${connectionStatus}`}>
                                {connectionStatus === "connected" ? "● Live" : connectionStatus === "error" ? "⚠ Lỗi" : "○ Offline"}
                            </span>
                        </div>
                    </div>

                    {selectedTarget ? (
                        <>
                            <div className="chat-header">
                                <div className="chat-header-info">
                                    <span className="active-target-name">{selectedTarget.name}</span>
                                    <span className="active-target-sub">{selectedTarget.subLabel}</span>
                                </div>
                            </div>

                            <div className="messages-container custom-scroll">
                                {currentMessages.length === 0 ? (
                                    <div className="chat-empty-state">
                                        <p>Chưa có tin nhắn nào với {selectedTarget.name}.</p>
                                    </div>
                                ) : (
                                    groupMessagesByDate(currentMessages).map(item => {
                                        if (item.type === "date") {
                                            return (
                                                <div key={item.key} className="msg-date-separator">
                                                    <span>{item.label}</span>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div key={item.id} className={`msg-bubble ${item.from === 'me' ? 'msg-me' : 'msg-other'}`}>
                                                {item.from !== "me" && item.senderName && (
                                                    <div className="msg-sender">{item.senderName}</div>
                                                )}
                                                <div className="msg-content">{item.text}</div>
                                                <span className="msg-time">{item.time}</span>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="chat-input-wrapper">
                                <form className="chat-input-form" onSubmit={handleSendMessage}>
                                    <input
                                        type="text"
                                        placeholder="Nhập tin nhắn..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                    />
                                    <button type="submit" className="send-btn" disabled={!inputValue.trim()}>
                                        <FiSend />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="chat-empty-state-large">
                            <FiMessageSquare className="chat-large-icon" />
                            <h3>Trung tâm Liên lạc</h3>
                            <p>Chọn một liên hệ từ danh sách bên trái để bắt đầu trò chuyện.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
