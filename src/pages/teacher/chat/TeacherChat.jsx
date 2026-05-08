import React, { useState, useMemo, useEffect, useRef } from "react";
import { FiSearch, FiSend, FiUsers, FiMessageSquare, FiHash, FiUser, FiInfo } from "react-icons/fi";
import { homeroomData } from "../homeroom/data/homeroomData";
import { teacherService } from "../../../services/pages/teacher/teacherService";
import "./TeacherChat.css";

const ROOMS = [
    { id: "homeroom",   name: "Lớp Chủ Nhiệm", icon: FiUsers,   label: "Phụ huynh" },
    { id: "department", name: "Bộ Môn",        icon: FiHash,    label: "Đồng nghiệp" },
    { id: "technical",  name: "Hỗ trợ",        icon: FiInfo,    label: "Kỹ thuật" },
];

const MOCK_DEPT_TEACHERS = [
    { id: "t1", name: "Thầy Nguyễn Văn An", role: "Tổ trưởng", status: "online" },
    { id: "t2", name: "Cô Trần Thị Bình", role: "Giáo viên", status: "offline" },
    { id: "t3", name: "Thầy Lê Văn Cường", role: "Giáo viên", status: "online" },
    { id: "t4", name: "Cô Phạm Thu Hà", role: "Giáo viên", status: "online" },
];

export default function TeacherChat() {
    const [activeRoomId, setActiveRoomId] = useState("homeroom");
    const [selectedTarget, setSelectedTarget] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [messagesByTarget, setMessagesByTarget] = useState({});
    const [apiContacts, setApiContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const activeRoom = useMemo(() => ROOMS.find(r => r.id === activeRoomId), [activeRoomId]);

    const targets = useMemo(() => {
        // If API has data, use it (filtered by roomId if BE supports it)
        if (apiContacts.length > 0) {
            return apiContacts.filter(c => c.roomId === activeRoomId || !c.roomId);
        }

        // Fallback to existing mock logic
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
    }, [selectedTarget, messagesByTarget]);

    useEffect(() => {
        const fetchContacts = async () => {
            setIsLoading(true);
            try {
                // Try real API
                const response = await teacherService.getChatContacts({ mock: false });
                if (response.success && response.data) {
                    setApiContacts(response.data);
                }
            } catch (err) {
                console.warn("Real Chat API failed, using service mock:", err);
                // Fallback to service mock explicitly
                try {
                    const mockRes = await teacherService.getChatContacts({ mock: true });
                    if (mockRes.success && mockRes.data) {
                        setApiContacts(mockRes.data);
                    }
                } catch (mockErr) {
                    console.error("Service mock also failed:", mockErr);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchContacts();
    }, []);

    useEffect(() => {
        if (!selectedTarget) return;
        const fetchMessages = async () => {
            try {
                const response = await teacherService.getChatMessages({ 
                    mock: false,
                    pathParams: { targetId: selectedTarget.id }
                });
                if (response.success && response.data) {
                    setMessagesByTarget(prev => ({
                        ...prev,
                        [selectedTarget.id]: response.data
                    }));
                }
            } catch (err) {
                console.error("Chat API messages error:", err);
            }
        };
        fetchMessages();
    }, [selectedTarget]);

    useEffect(() => {
        setSelectedTarget(null);
        setSearchQuery("");
    }, [activeRoomId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const text = inputValue.trim();
        if (!selectedTarget || !text) return;

        const newMessage = {
            id: Date.now(),
            text,
            from: "me",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Update UI optimistically
        setMessagesByTarget(prev => ({
            ...prev,
            [selectedTarget.id]: [...(prev[selectedTarget.id] || []), newMessage]
        }));
        setInputValue("");

        // Call API
        try {
            await teacherService.sendMessage({
                mock: false,
                body: {
                    targetId: selectedTarget.id,
                    text: text,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (err) {
            console.error("Failed to send message via API:", err);
            // Optional: Show error to user or revert UI
        }
    };

    return (
        <div className="teacher-chat-page">
            <div className="teacher-chat-container">
                {/* 1. Target List & Room Tabs */}
                <div className="chat-target-list-wrapper">
                    <div className="chat-room-tabs">
                        {ROOMS.map(room => (
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
                        {filteredTargets.map(target => (
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
                        ))}
                    </div>
                </div>

                {/* 2. Main Chat Area */}
                <div className="chat-main-area">
                    <div className="chat-main-header">
                        <h2>{activeRoom?.name}</h2>
                        <p>{activeRoomId === 'homeroom' ? 'Trao đổi với phụ huynh học sinh' : 'Thảo luận nội bộ trường học'}</p>
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
                                {(messagesByTarget[selectedTarget.id] || []).length === 0 ? (
                                    <div className="chat-empty-state">
                                        <p>Chưa có tin nhắn nào với {selectedTarget.name}.</p>
                                    </div>
                                ) : (
                                    messagesByTarget[selectedTarget.id].map(msg => (
                                        <div key={msg.id} className={`msg-bubble ${msg.from === 'me' ? 'msg-me' : 'msg-other'}`}>
                                            <div className="msg-content">{msg.text}</div>
                                            <span className="msg-time">{msg.time}</span>
                                        </div>
                                    ))
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

