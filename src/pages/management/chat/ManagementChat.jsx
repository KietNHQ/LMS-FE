import React, { useState, useMemo, useEffect, useRef } from "react";
import { FiSearch, FiSend, FiUsers, FiMessageSquare, FiHash, FiUser, FiInfo, FiActivity } from "react-icons/fi";
import "./ManagementChat.css";

const ROOMS = [
    { id: "staff",      name: "Phòng Ban",      icon: FiHash,     label: "Nhân viên" },
    { id: "management", name: "Ban Giám Hiệu",  icon: FiActivity, label: "Ban điều hành" },
];

const MOCK_STAFF = [
    { id: "s1", name: "Nguyễn Văn Nam", role: "Kế toán", status: "online" },
    { id: "s2", name: "Lê Thị Hồng", role: "Giáo vụ", status: "offline" },
    { id: "s3", name: "Phạm Minh Đức", role: "Y tế", status: "online" },
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
                status: s.status
            }));
        }
        return [
            { id: "principal-1", name: "Hiệu trưởng - Thầy Tùng", subLabel: "Điều hành", avatar: "H", type: "admin" }
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
                            placeholder="Tìm kiếm..." 
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

                <div className="chat-main-area">
                    <div className="chat-main-header">
                        <h2>{activeRoom?.name}</h2>
                        <p>Điều hành và quản lý nội bộ trường học</p>
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
                                        <p>Bắt đầu cuộc hội thoại với {selectedTarget.name}.</p>
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
                                        placeholder="Nhập nội dung..." 
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
                            <FiActivity className="chat-large-icon" />
                            <h3>Trung tâm Điều hành</h3>
                            <p>Vui lòng chọn một nhân sự hoặc phòng ban để bắt đầu trao đổi.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
