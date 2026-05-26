import React, { useState, useMemo, useEffect, useRef } from "react";
import { FiSearch, FiSend, FiUsers, FiMessageSquare } from "react-icons/fi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherService } from "../../../../../services/pages/teacher";
import "./HomeroomParentChatSection.css";

const getCurrentUserId = () => {
    try {
        const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        return user?.id || null;
    } catch {
        return null;
    }
};

const HomeroomParentChatSection = ({ data }) => {
    const classId = data?.id;
    const queryClient = useQueryClient();

    const [selectedParent, setSelectedParent] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [inputValue, setInputValue] = useState("");
    const messagesEndRef = useRef(null);

    // ── Fetch parents for this class ────────────────────────────────────────
    const {
        data: parentsData,
        isLoading: parentsLoading,
    } = useQuery({
        queryKey: ["homeroom-class-parents", classId],
        queryFn: () =>
            teacherService.getClassParents({
                pathParams: { classId },
                mock: false,
            }),
        enabled: Boolean(classId),
    });

    const classParents = parentsData?.data?.parents || [];

    // ── Fetch conversations for this class ───────────────────────────────────
    const {
        data: conversationsData,
        isLoading: convsLoading,
    } = useQuery({
        queryKey: ["homeroom-class-conversations", classId],
        queryFn: () =>
            teacherService.getHumanConversationsByClassId({
                params: { classId },
                mock: false,
            }),
        enabled: Boolean(classId),
    });

    const conversations = useMemo(() => {
        return conversationsData?.data?.conversations || [];
    }, [conversationsData?.data?.conversations]);

    // Map parent_user_id → conversation
    const convByParentId = useMemo(() => {
        const map = {};
        for (const conv of conversations) {
            if (conv.other_user_id) {
                map[conv.other_user_id] = conv;
            }
        }
        return map;
    }, [conversations]);

    // ── Fetch messages for selected parent's conversation ────────────────────
    const selectedConversation = selectedParent
        ? convByParentId[selectedParent.parent_user_id]
        : null;

    const {
        data: messagesData,
        isLoading: messagesLoading,
    } = useQuery({
        queryKey: ["homeroom-parent-messages", selectedConversation?.id],
        queryFn: () =>
            teacherService.getHumanMessages({
                pathParams: { conversationId: selectedConversation.id },
                mock: false,
            }),
        enabled: Boolean(selectedConversation?.id),
        refetchInterval: 10000,
    });

    const apiMessages = useMemo(() => {
        return messagesData?.data?.messages || [];
    }, [messagesData?.data?.messages]);

    // ── Send message mutation ───────────────────────────────────────────────
    const sendMutation = useMutation({
        mutationFn: (content) =>
            teacherService.sendMessageToParent({
                pathParams: { parentId: selectedParent.parent_user_id },
                body: {
                    message: content,
                    classId: classId ? Number(classId) : undefined,
                },
                mock: false,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["homeroom-class-conversations", classId],
            });
            queryClient.invalidateQueries({
                queryKey: ["homeroom-parent-messages", selectedConversation?.id],
            });
            setInputValue("");
        },
    });

    // ── Mark as read mutation ───────────────────────────────────────────────
    const markReadMutation = useMutation({
        mutationFn: (conversationId) =>
            teacherService.markChatAsRead({
                pathParams: { conversationId },
                mock: false,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["homeroom-class-conversations", classId],
            });
        },
    });

    // Mark conversation as read when selecting a parent
    useEffect(() => {
        if (!selectedConversation) return;
        markReadMutation.mutate(selectedConversation.id);
        // markReadMutation is stable (useMutation) - intentionally excluded from deps
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedConversation?.id]);

    // ── Derived parent list ──────────────────────────────────────────────────
    const parents = useMemo(() => {
        if (!classParents.length) return [];
        // If we have real parent data from BE, use it
        return classParents.map((p) => ({
            id: p.student_id,
            parent_user_id: p.parent_user_id,
            name: p.parent_name,
            studentName: p.student_name,
            phone: p.parent_phone,
            hasConversation: Boolean(convByParentId[p.parent_user_id]),
            unreadCount:
                convByParentId[p.parent_user_id]?.unread_count || 0,
        }));
    }, [classParents, convByParentId]);

    const filteredParents = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return parents;
        return parents.filter(
            (p) =>
                p.name.toLowerCase().includes(query) ||
                p.studentName.toLowerCase().includes(query),
        );
    }, [parents, searchQuery]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedParent, apiMessages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        const text = inputValue.trim();
        if (!selectedParent || !text) return;
        sendMutation.mutate(text);
    };

    const isLoading = parentsLoading || convsLoading || messagesLoading;

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
                    {isLoading ? (
                        <div style={{ padding: "1rem", color: "#94a3b8", fontSize: "0.85rem" }}>
                            Đang tải...
                        </div>
                    ) : filteredParents.length === 0 ? (
                        <div style={{ padding: "1rem", color: "#94a3b8", fontSize: "0.85rem" }}>
                            Không có phụ huynh nào
                        </div>
                    ) : (
                        filteredParents.map((parent) => (
                            <div
                                key={parent.parent_user_id}
                                className={`parent-item ${
                                    selectedParent?.parent_user_id ===
                                    parent.parent_user_id
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() => setSelectedParent(parent)}
                            >
                                <div className="parent-avatar">
                                    {parent.name.charAt(0)}
                                </div>
                                <div className="parent-info">
                                    <span className="parent-name">
                                        {parent.name}
                                    </span>
                                    <span className="student-name">
                                        PH: {parent.studentName}
                                    </span>
                                </div>
                                {parent.unreadCount > 0 && (
                                    <div className="unread-dot" />
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat main area */}
            <div className="chat-main-area">
                {selectedParent ? (
                    <>
                        <div className="chat-header">
                            <span className="active-parent-name">
                                Trò chuyện với: {selectedParent.name} (PH em{" "}
                                {selectedParent.studentName})
                            </span>
                        </div>

                        <div className="messages-container custom-scroll">
                            {messagesLoading ? (
                                <div
                                    style={{
                                        textAlign: "center",
                                        color: "#94a3b8",
                                        padding: "2rem",
                                    }}
                                >
                                    Đang tải tin nhắn...
                                </div>
                            ) : apiMessages.length === 0 ? (
                                <div className="chat-empty-state">
                                    <p>
                                        Chưa có tin nhắn. Hãy bắt đầu cuộc trò
                                        chuyện!
                                    </p>
                                </div>
                            ) : (
                                apiMessages.map((msg) => {
                                    const currentUserId = getCurrentUserId();
                                    const isMe = msg.user_id === currentUserId;
                                    return (
                                        <div
                                            key={msg.id}
                                            className={`msg-bubble ${
                                                isMe ? "msg-me" : "msg-other"
                                            }`}
                                        >
                                            {msg.content}
                                            <span className="msg-time">
                                                {new Date(
                                                    msg.created_at,
                                                ).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="chat-input-wrapper">
                            <form
                                className="chat-input-form"
                                onSubmit={handleSendMessage}
                            >
                                <input
                                    type="text"
                                    placeholder="Nhập nội dung tin nhắn..."
                                    value={inputValue}
                                    onChange={(e) =>
                                        setInputValue(e.target.value)
                                    }
                                />
                                <button
                                    type="submit"
                                    className="send-btn"
                                    disabled={
                                        !inputValue.trim() ||
                                        sendMutation.isPending
                                    }
                                >
                                    <FiSend />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="chat-empty-state">
                        <FiMessageSquare className="chat-empty-icon" />
                        <h3>Liên lạc với Phụ huynh</h3>
                        <p>
                            Chọn một phụ huynh từ danh sách bên trái để bắt đầu
                            trao đổi về tình hình học tập của học sinh.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeroomParentChatSection;
