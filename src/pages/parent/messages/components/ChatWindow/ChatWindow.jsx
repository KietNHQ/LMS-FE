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
            <div className="chat-window empty">
                <FiUsers className="empty-icon" />

                <h3>Chọn phụ huynh để bắt đầu trò chuyện</h3>
                <p>Kết nối và chia sẻ kinh nghiệm nuôi dạy con cái</p>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <span className="chat-header-name">{user.name}</span>
            </div>

            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="message other">
                        Chưa có tin nhắn, hãy gửi lời chào đầu tiên.
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`message ${message.from === "me" ? "me" : "other"}`}
                        >
                            {message.text}
                        </div>
                    ))
                )}
            </div>

            <form
                className="chat-input"
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
                    className={`send-btn ${hasText ? "active" : ""}`}
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