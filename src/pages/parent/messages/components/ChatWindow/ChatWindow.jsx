import React from "react";
import "./ChatWindow.css";
import { FiUsers, FiSend } from "react-icons/fi";

export default function ChatWindow({
                                       user,
                                       messages,
                                       inputValue,
                                       onInputChange,
                                       onSend
                                   }) {
    const hasText = inputValue.trim().length > 0;

    if (!user) {
        return (
            <div className="parent-chat-window parent-chat-empty">
                <FiUsers className="parent-chat-empty-icon" />

                <h3>Chọn giáo viên để bắt đầu trò chuyện</h3>
                <p>Trao đổi với giáo viên chủ nhiệm về tình hình học tập của con.</p>
            </div>
        );
    }

    return (
        <div className="parent-chat-window">
            <div className="parent-chat-header">
                <span className="parent-chat-header-name">{user.name}</span>
            </div>

            <div className="parent-chat-messages">
                {messages.length === 0 ? (
                    <div className="parent-chat-message parent-chat-message--other">
                        Chưa có tin nhắn, hãy gửi lời chào đầu tiên.
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`parent-chat-message ${
                                message.from === "me"
                                    ? "parent-chat-message--me"
                                    : "parent-chat-message--other"
                            }`}
                        >
                            {message.text}
                        </div>
                    ))
                )}
            </div>

            <form
                className="parent-chat-input"
                onSubmit={(event) => {
                    event.preventDefault();
                    if (!hasText) return;
                    onSend();
                }}
            >
                <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={inputValue}
                    onChange={(event) => onInputChange(event.target.value)}
                />

                <button
                    type="submit"
                    className={`parent-chat-send-btn ${hasText ? "is-active" : ""}`}
                    disabled={!hasText}
                    aria-label="Gửi tin nhắn"
                    title="Gửi"
                >
                    <FiSend />
                </button>
            </form>
        </div>
    );
}

