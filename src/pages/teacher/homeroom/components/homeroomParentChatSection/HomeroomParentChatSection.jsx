import React, { useState, useMemo, useEffect, useRef } from "react";
import { FiSearch, FiSend, FiUsers, FiMessageSquare } from "react-icons/fi";
import "./HomeroomParentChatSection.css";

const HomeroomParentChatSection = ({ data, onMarkAsRead }) => {
    const [selectedParent, setSelectedParent] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [messagesByParent, setMessagesByParent] = useState({});
    const messagesEndRef = useRef(null);

    // Prepare parent list from students
    const parents = useMemo(() => {
        if (!data?.students) return [];
        // Group by parent name to avoid duplicates if siblings have same parent name
        // In this mock data, each student has one parentName
        return data.students.map(student => ({
            id: student.id,
            name: student.parentName,
            studentName: student.name,
            phone: student.parentPhone
        }));
    }, [data]);

    const filteredParents = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return parents;
        return parents.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.studentName.toLowerCase().includes(query)
        );
    }, [parents, searchQuery]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedParent, messagesByParent]);

    // Mark as read when opening a parent chat
    useEffect(() => {
        if (selectedParent) {
            onMarkAsRead?.(selectedParent.id);
        }
    }, [selectedParent, onMarkAsRead]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        const text = inputValue.trim();
        if (!selectedParent || !text) return;

        const newMessage = {
            id: Date.now(),
            text,
            from: "me",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessagesByParent(prev => ({
            ...prev,
            [selectedParent.id]: [...(prev[selectedParent.id] || []), newMessage]
        }));

        setInputValue("");
    };

    return (
        <div className="homeroom-parent-chat">
            {/* Sidebar list of parents */}
            <div className="parent-list-wrapper">
                <div className="parent-list-header">
                    <FiUsers />
                    <h4>Phụ huynh lớp {data.name}</h4>
                </div>

                <div className="parent-search">
                    <FiSearch className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Tìm phụ huynh..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="parent-list-items custom-scroll">
                    {filteredParents.map(parent => (
                        <div 
                            key={parent.id} 
                            className={`parent-item ${selectedParent?.id === parent.id ? 'active' : ''}`}
                            onClick={() => setSelectedParent(parent)}
                        >
                            <div className="parent-avatar">
                                {parent.name.charAt(0)}
                            </div>
                            <div className="parent-info">
                                <span className="parent-name">{parent.name}</span>
                                <span className="student-name">PH: {parent.studentName}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat main area */}
            <div className="chat-main-area">
                {selectedParent ? (
                    <>
                        <div className="chat-header">
                            <span className="active-parent-name">
                                Trò chuyện với: {selectedParent.name} (PH em {selectedParent.studentName})
                            </span>
                        </div>

                        <div className="messages-container custom-scroll">
                            {(messagesByParent[selectedParent.id] || []).length === 0 ? (
                                <div className="chat-empty-state">
                                    <p>Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện!</p>
                                </div>
                            ) : (
                                messagesByParent[selectedParent.id].map(msg => (
                                    <div key={msg.id} className={`msg-bubble ${msg.from === 'me' ? 'msg-me' : 'msg-other'}`}>
                                        {msg.text}
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
                                    placeholder="Nhập nội dung tin nhắn..." 
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
                    <div className="chat-empty-state">
                        <FiMessageSquare className="chat-empty-icon" />
                        <h3>Liên lạc với Phụ huynh</h3>
                        <p>Chọn một phụ huynh từ danh sách bên trái để bắt đầu trao đổi về tình hình học tập của học sinh.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeroomParentChatSection;
