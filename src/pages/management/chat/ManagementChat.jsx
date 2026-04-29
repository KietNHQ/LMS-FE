import React, { useState, useMemo, useEffect, useRef } from "react";
import { FiSearch, FiSend, FiUsers, FiMessageSquare, FiHash, FiUser, FiInfo, FiActivity, FiMoreVertical, FiPaperclip, FiSmile } from "react-icons/fi";
import "./ManagementChat.css";

const ROOMS = [
    { id: "staff",      name: "Phòng Ban",      icon: FiHash,     label: "Nhân viên" },
    { id: "management", name: "Ban Giám Hiệu",  icon: FiActivity, label: "Ban điều hành" },
];

const MOCK_STAFF = [
    { id: "s1", name: "Nguyễn Văn Nam", role: "Kế toán", status: "online", lastMsg: "Đã gửi báo cáo quyết toán tháng 4..." },
    { id: "s2", name: "Lê Thị Hồng", role: "Giáo vụ", status: "offline", lastMsg: "Thầy xem giúp em lịch trực..." },
    { id: "s3", name: "Phạm Minh Đức", role: "Y tế", status: "online", lastMsg: "Vật tư y tế đã được nhập kho." },
];

export default function ManagementChat() {
    const [activeRoomId, setActiveRoomId] = useState("staff");
    const [selectedTarget, setSelectedTarget] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [messagesByTarget, setMessagesByTarget] = useState({});
    const messagesEndRef = useRef(null);

    const activeRoom = useMemo(() => ROOMS.find(r => r.id === activeRoomId), [activeRoomId]);

    const targets = useMemo(() => {
        if (activeRoomId === "staff") {
            return MOCK_STAFF.map(s => ({
                id: `staff-${s.id}`,
                name: s.name,
                subLabel: s.role,
                avatar: s.name.charAt(0),
                type: "staff",
                status: s.status,
                lastMsg: s.lastMsg
            }));
        }
        return [
            { id: "principal-1", name: "Thầy Tùng", subLabel: "Hiệu trưởng", avatar: "T", type: "admin", status: "online", lastMsg: "Cần họp gấp bộ phận chuyên môn." }
        ];
    }, [activeRoomId]);

    const filteredTargets = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return targets;
        return targets.filter(t => 
            t.name.toLowerCase().includes(query) || 
            (t.subLabel && t.subLabel.toLowerCase().includes(query))
        );
    }, [targets, searchQuery]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedTarget, messagesByTarget]);

    useEffect(() => {
        setSelectedTarget(null);
        setSearchQuery("");
    }, [activeRoomId]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        const text = inputValue.trim();
        if (!selectedTarget || !text) return;

        const newMessage = {
            id: Date.now(),
            text,
            from: "me",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessagesByTarget(prev => ({
            ...prev,
            [selectedTarget.id]: [...(prev[selectedTarget.id] || []), newMessage]
        }));
        setInputValue("");
    };

    return (
        <div className="management-chat-page">
            <div className="management-chat-container">
                {/* Sidebar */}
                <div className="chat-sidebar">
                    <div className="sidebar-header">
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
                                placeholder="Tìm kiếm hội thoại..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="target-list-items custom-scroll">
                        {filteredTargets.map(target => (
                            <div 
                                key={target.id} 
                                className={`target-item ${selectedTarget?.id === target.id ? 'active' : ''}`}
                                onClick={() => setSelectedTarget(target)}
                            >
                                <div className={`target-avatar-wrapper ${target.type}`}>
                                    <div className="target-avatar">
                                        {target.avatar}
                                    </div>
                                    <span className={`status-indicator ${target.status}`}></span>
                                </div>
                                <div className="target-info">
                                    <div className="info-top">
                                        <span className="target-name">{target.name}</span>
                                        <span className="last-time">10:45</span>
                                    </div>
                                    <div className="info-bottom">
                                        <span className="target-sub">{target.subLabel}</span>
                                        <span className="last-msg-preview">{target.lastMsg}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="chat-main-area">
                    {selectedTarget ? (
                        <>
                            <div className="chat-header">
                                <div className="chat-header-left">
                                    <div className={`target-avatar-wrapper small ${selectedTarget.type}`}>
                                        <div className="target-avatar">
                                            {selectedTarget.avatar}
                                        </div>
                                    </div>
                                    <div className="chat-header-info">
                                        <span className="active-target-name">{selectedTarget.name}</span>
                                        <span className="active-target-status">
                                            {selectedTarget.status === 'online' ? 'Đang hoạt động' : 'Ngoại tuyến'}
                                        </span>
                                    </div>
                                </div>
                                <div className="chat-header-actions">
                                    <button className="action-btn"><FiSearch /></button>
                                    <button className="action-btn"><FiInfo /></button>
                                    <button className="action-btn"><FiMoreVertical /></button>
                                </div>
                            </div>

                            <div className="messages-container custom-scroll">
                                {(messagesByTarget[selectedTarget.id] || []).length === 0 ? (
                                    <div className="chat-welcome-box">
                                        <div className="welcome-avatar">{selectedTarget.avatar}</div>
                                        <h3>Bắt đầu cuộc trò chuyện</h3>
                                        <p>Gửi tin nhắn để bắt đầu trao đổi công việc với <strong>{selectedTarget.name}</strong> ({selectedTarget.subLabel})</p>
                                        <span className="safety-note">Toàn bộ cuộc hội thoại đều được bảo mật.</span>
                                    </div>
                                ) : (
                                    <div className="messages-list">
                                        {messagesByTarget[selectedTarget.id].map(msg => (
                                            <div key={msg.id} className={`msg-bubble-wrapper ${msg.from === 'me' ? 'me' : 'other'}`}>
                                                <div className="msg-bubble">
                                                    <div className="msg-content">{msg.text}</div>
                                                    <span className="msg-time">{msg.time}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="chat-input-area">
                                <div className="chat-input-toolbar">
                                    <button className="tool-btn"><FiPaperclip /></button>
                                    <button className="tool-btn"><FiSmile /></button>
                                </div>
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
                            <div className="empty-icon-wrapper">
                                <FiMessageSquare className="chat-large-icon" />
                            </div>
                            <h3>Trung tâm Trao đổi Nội bộ</h3>
                            <p>Chọn một nhân sự hoặc phòng ban từ danh sách bên trái để bắt đầu làm việc và trao đổi thông tin.</p>
                            <div className="empty-hints">
                                <span><FiHash /> Nhóm phòng ban</span>
                                <span><FiUser /> Tin nhắn cá nhân</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
