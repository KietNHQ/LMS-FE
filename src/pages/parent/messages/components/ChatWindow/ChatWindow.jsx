import React, { useEffect, useRef } from "react";
import "./ChatWindow.css";
import { FiUsers, FiSend } from "react-icons/fi";

// Group messages by date
const groupMessagesByDate = (messages) => {
    const groups = [];
    let lastDate = null;

    for (const msg of messages) {
        const d = new Date(msg.createdAt || msg.created_at || Date.now());
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

export default function ChatWindow({
    teacher,
    messages,
    inputValue,
    onInputChange,
    onSend,
    isSending = false,
    currentUserId = null
}) {
    const messagesEndRef = useRef(null);
    const hasText = inputValue.trim().length > 0;

    // Auto scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (!teacher) {
        return (
            <div className="parent-chat-window parent-chat-empty">
                <FiUsers className="parent-chat-empty-icon" />
                <h3>Chọn giáo viên để bắt đầu trò chuyện</h3>
                <p>Trao đổi với giáo viên chủ nhiệm về tình hình học tập của con.</p>
            </div>
        );
    }

    // Format children names for header
    const childNames = teacher.children?.map(c => c.studentName || c.student_name || "").join(", ") || "";
    const childText = teacher.children?.length > 0 ? `PH em: ${childNames}` : "";

    const groupedMessages = groupMessagesByDate(messages);

    return (
        <div className="parent-chat-window">
            <div className="parent-chat-header">
                <div className="parent-chat-header-info">
                    <span className="parent-chat-header-name">{teacher.name}</span>
                    {teacher.className && (
                        <span className="parent-chat-header-class">GVCN lớp {teacher.className}</span>
                    )}
                </div>
                {childText && (
                    <span className="parent-chat-header-sub">{childText}</span>
                )}
            </div>

            <div className="parent-chat-messages">
                {messages.length === 0 ? (
                    <div className="parent-chat-empty-messages">
                        <p>Chưa có tin nhắn, hãy gửi lời chào đầu tiên.</p>
                    </div>
                ) : (
                    groupedMessages.map((item, idx) => {
                        if (item.type === "date") {
                            return (
                                <div key={item.key} className="parent-chat-date">
                                    <span>{item.label}</span>
                                </div>
                            );
                        }

                        // Determine if this is my message by comparing user_id
                        const msgUserId = item.user_id || item.userId;
                        const isMyMessage = currentUserId && msgUserId === currentUserId || item.from === 'me' || item.role === 'parent';
                        // Get sender name from API response
                        const senderName = item.user_full_name || item.senderName || "";

                        // Find prev and next messages to calculate group classes
                        let prevMsg = null;
                        for (let i = idx - 1; i >= 0; i--) {
                            if (groupedMessages[i].type === "message") {
                                prevMsg = groupedMessages[i];
                                break;
                            }
                        }

                        let nextMsg = null;
                        for (let i = idx + 1; i < groupedMessages.length; i++) {
                            if (groupedMessages[i].type === "message") {
                                nextMsg = groupedMessages[i];
                                break;
                            }
                        }

                        const isMe = isMyMessage;
                        const prevIsMe = prevMsg ? (currentUserId && (prevMsg.user_id || prevMsg.userId) === currentUserId || prevMsg.from === 'me' || prevMsg.role === 'parent') : null;
                        const nextIsMe = nextMsg ? (currentUserId && (nextMsg.user_id || nextMsg.userId) === currentUserId || nextMsg.from === 'me' || nextMsg.role === 'parent') : null;

                        const isGroupStart = prevMsg === null || prevIsMe !== isMe;
                        const isGroupEnd = nextMsg === null || nextIsMe !== isMe;

                        let groupClass = "";
                        if (isGroupStart && isGroupEnd) {
                            groupClass = "parent-chat-message--single";
                        } else if (isGroupStart) {
                            groupClass = "parent-chat-message--start";
                        } else if (isGroupEnd) {
                            groupClass = "parent-chat-message--end";
                        } else {
                            groupClass = "parent-chat-message--middle";
                        }

                        return (
                            <div
                                key={item.id || idx}
                                className={`parent-chat-message-wrapper ${
                                    isMyMessage
                                        ? "parent-chat-message-wrapper--me"
                                        : "parent-chat-message-wrapper--other"
                                } ${isGroupStart ? "group-start" : ""} ${isGroupEnd ? "group-end" : ""}`}
                            >
                                {isGroupStart && !isMyMessage && senderName && (
                                    <div className="message-sender-name">{senderName}</div>
                                )}
                                <div
                                    className={`parent-chat-message ${
                                        isMyMessage
                                            ? "parent-chat-message--me"
                                            : "parent-chat-message--other"
                                    } ${groupClass}`}
                                >
                                    <div className="message-text">{item.content || item.text}</div>
                                    {item.createdAt && (
                                        <span className="message-time">
                                            {new Date(item.createdAt).toLocaleTimeString("vi-VN", {
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form
                className="parent-chat-input"
                onSubmit={(event) => {
                    event.preventDefault();
                    if (!hasText || isSending) return;
                    onSend();
                }}
            >
                <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={inputValue}
                    onChange={(event) => onInputChange(event.target.value)}
                    disabled={isSending}
                />

                <button
                    type="submit"
                    className={`parent-chat-send-btn ${hasText && !isSending ? "is-active" : ""}`}
                    disabled={!hasText || isSending}
                    aria-label="Gửi tin nhắn"
                    title="Gửi"
                >
                    <FiSend />
                </button>
            </form>
        </div>
    );
}
