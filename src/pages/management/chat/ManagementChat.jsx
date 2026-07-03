import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { FiSearch, FiSend, FiUsers, FiMessageSquare, FiHash, FiUser, FiInfo, FiActivity, FiMoreVertical, FiPaperclip, FiSmile, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import managementChatService from "../../../services/pages/management/chat/managementChatService";
import "./ManagementChat.css";

const ROLE_LABELS = {
  admin: "Quản trị viên",
  manager: "Quản lý",
  principal: "Hiệu trưởng",
  teacher: "Giáo viên",
  staff: "Nhân viên",
};

export default function ManagementChat() {
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
  }, []);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadContacts = async () => {
    setIsLoadingContacts(true);
    try {
      const response = await managementChatService.getContacts();
      if (response.success) {
        setContacts(response.data || []);
      } else {
        toast.error(response.error || "Không thể tải danh sách liên hệ");
      }
    } catch (error) {
      console.error("Failed to load contacts:", error);
      toast.error("Không thể tải danh sách liên hệ");
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const loadConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const response = await managementChatService.getConversations();
      if (response.success) {
        setConversations(response.conversations || []);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadMessages = useCallback(async (conversationId) => {
    setIsLoadingMessages(true);
    try {
      const response = await managementChatService.getMessages(conversationId);
      if (response.success) {
        setMessages(response.messages || []);
      } else {
        toast.error(response.error || "Không thể tải tin nhắn");
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast.error("Không thể tải tin nhắn");
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    } else {
      setMessages([]);
    }
  }, [selectedConversation, loadMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedConversation]);

  // Get current user from storage
  const currentUser = useMemo(() => {
    try {
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : {};
    } catch {
      return {};
    }
  }, []);

  const currentUserId = currentUser?.id;
  const currentUserRole = currentUser?.role?.toLowerCase();

  // Filter contacts based on search
  const filteredContacts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return contacts;
    return contacts.filter(c =>
      (c.full_name || "").toLowerCase().includes(query) ||
      (c.email || "").toLowerCase().includes(query) ||
      (c.manager_title || "").toLowerCase().includes(query) ||
      (ROLE_LABELS[c.role] || c.role || "").toLowerCase().includes(query)
    );
  }, [contacts, searchQuery]);

  // Combined list: existing conversations + contacts (avoiding duplicates)
  const conversationTargets = useMemo(() => {
    const convMap = {};
    conversations.forEach(conv => {
      const otherId = conv.other_user_id;
      const otherName = conv.other_full_name;
      const otherRole = conv.other_user_role;
      if (otherId) {
        convMap[otherId] = {
          id: otherId,
          conversationId: conv.id,
          name: otherName,
          subLabel: ROLE_LABELS[otherRole] || otherRole || "",
          avatar: (otherName || "?").charAt(0).toUpperCase(),
          type: otherRole || "user",
          lastMsg: conv.last_message || "",
          lastTime: conv.last_message_at
            ? new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : "",
          unreadCount: conv.unread_count || 0,
          isConversation: true,
        };
      }
    });

    const contactTargets = contacts
      .filter(c => !convMap[c.id])
      .map(c => ({
        id: c.id,
        conversationId: null,
        name: c.full_name,
        subLabel: c.manager_title || ROLE_LABELS[c.role] || c.role || "",
        avatar: (c.full_name || "?").charAt(0).toUpperCase(),
        type: c.role || "user",
        lastMsg: "",
        lastTime: "",
        unreadCount: 0,
        isConversation: false,
      }));

    return [...Object.values(convMap), ...contactTargets];
  }, [conversations, contacts]);

  const filteredTargets = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return conversationTargets;
    return conversationTargets.filter(t =>
      (t.name || "").toLowerCase().includes(query) ||
      (t.subLabel || "").toLowerCase().includes(query)
    );
  }, [conversationTargets, searchQuery]);

  const handleStartConversation = async (contact) => {
    try {
      const response = await managementChatService.startConversation(contact.id);
      if (response.success) {
        const conversationId = response.data.conversationId;
        const convData = {
          id: conversationId,
          other_user_id: contact.id,
          other_full_name: contact.full_name,
          other_user_role: contact.role,
          last_message: "",
          unread_count: 0,
        };

        // Add to conversations if not already there
        setConversations(prev => {
          const exists = prev.find(c => c.id === conversationId);
          if (exists) return prev;
          return [convData, ...prev];
        });

        setSelectedConversation({ id: conversationId, other_user_id: contact.id, other_full_name: contact.full_name, other_user_role: contact.role });
        setSelectedContact(null);
        toast.success(`Đã bắt đầu cuộc trò chuyện với ${contact.full_name}`);
      } else {
        toast.error(response.error || "Không thể bắt đầu cuộc trò chuyện");
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Không thể bắt đầu cuộc trò chuyện");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!selectedConversation || !text) return;

    setIsSending(true);
    try {
      const response = await managementChatService.sendMessage(selectedConversation.id, text);
      if (response.success) {
        const newMessage = {
          id: response.data.id || Date.now(),
          content: text,
          user_id: currentUserId,
          sender_name: currentUser?.full_name || "Tôi",
          sender_role: currentUserRole,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, newMessage]);
        setInputValue("");
      } else {
        toast.error(response.error || "Không thể gửi tin nhắn");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Không thể gửi tin nhắn");
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!selectedConversation?.id || !messageId || String(messageId).startsWith("temp-")) return;

    const previousMessages = messages;
    setMessages((prev) => prev.filter((msg) => String(msg.id) !== String(messageId)));

    try {
      const response = await managementChatService.deleteMessage(messageId);
      if (response?.success === false) {
        setMessages(previousMessages);
        toast.error(response.error || "Không thể thu hồi tin nhắn");
        return;
      }
      toast.success("Đã thu hồi tin nhắn");
    } catch (error) {
      console.error("Failed to recall message:", error);
      setMessages(previousMessages);
      toast.error(error?.response?.data?.error || "Không thể thu hồi tin nhắn");
    }
  };

  const handleSelectConversation = (target) => {
    if (target.isConversation) {
      setSelectedConversation({
        id: target.conversationId,
        other_user_id: target.id,
        other_full_name: target.name,
        other_user_role: target.type,
      });
      setSelectedContact(null);
    } else {
      setSelectedConversation(null);
      setSelectedContact(target);
    }
  };

  const activeTarget = useMemo(() => {
    if (selectedConversation) {
      return conversationTargets.find(t => t.conversationId === selectedConversation.id) || {
        id: selectedConversation.other_user_id,
        name: selectedConversation.other_full_name,
        subLabel: ROLE_LABELS[selectedConversation.other_user_role] || selectedConversation.other_user_role,
        avatar: (selectedConversation.other_full_name || "?").charAt(0).toUpperCase(),
        type: selectedConversation.other_user_role,
      };
    }
    return null;
  }, [selectedConversation, conversationTargets]);

  return (
    <div className="management-chat-page">
      <div className="management-chat-container">
        {/* Sidebar */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title">Trò chuyện Nội bộ</div>

            <div className="target-search">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm liên hệ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="target-list-items custom-scroll">
            {isLoadingContacts && isLoadingConversations ? (
              <div className="chat-loading-state">
                <div className="loading-spinner"></div>
                <span>Đang tải...</span>
              </div>
            ) : filteredTargets.length === 0 ? (
              <div className="chat-empty-state">
                <FiUsers className="empty-icon" />
                <span>Không có liên hệ nào</span>
              </div>
            ) : (
              filteredTargets.map(target => (
                <div
                  key={target.conversationId || target.id}
                  className={`target-item ${
                    (selectedConversation?.id === target.conversationId ||
                      (selectedContact?.id === target.id && !target.isConversation))
                      ? "active"
                      : ""
                  }`}
                  onClick={() => handleSelectConversation(target)}
                >
                  <div className={`target-avatar-wrapper ${target.type}`}>
                    <div className="target-avatar">
                      {target.avatar}
                    </div>
                    {target.unreadCount > 0 && (
                      <span className="unread-badge">{target.unreadCount > 99 ? "99+" : target.unreadCount}</span>
                    )}
                  </div>
                  <div className="target-info">
                    <div className="info-top">
                      <span className="target-name">{target.name}</span>
                      <span className="last-time">{target.lastTime}</span>
                    </div>
                    <div className="info-bottom">
                      <span className="target-sub">{target.subLabel}</span>
                      {target.lastMsg && (
                        <span className="last-msg-preview">{target.lastMsg}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-main-area">
          {activeTarget ? (
            <>
              <div className="chat-header">
                <div className="chat-header-left">
                  <div className={`target-avatar-wrapper small ${activeTarget.type}`}>
                    <div className="target-avatar">
                      {activeTarget.avatar}
                    </div>
                  </div>
                  <div className="chat-header-info">
                    <span className="active-target-name">{activeTarget.name}</span>
                    <span className="active-target-status">{activeTarget.subLabel}</span>
                  </div>
                </div>
                <div className="chat-header-actions">
                  <button className="action-btn" title="Xóa cuộc trò chuyện">
                    <FiTrash2 />
                  </button>
                </div>
              </div>

              <div className="messages-container custom-scroll">
                {isLoadingMessages ? (
                  <div className="chat-loading-state">
                    <div className="loading-spinner"></div>
                    <span>Đang tải tin nhắn...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="chat-welcome-box">
                    <div className="welcome-avatar">{activeTarget.avatar}</div>
                    <h3>Bắt đầu cuộc trò chuyện</h3>
                    <p>Gửi tin nhắn để bắt đầu trao đổi công việc với <strong>{activeTarget.name}</strong> ({activeTarget.subLabel})</p>
                    <span className="safety-note">Toàn bộ cuộc hội thoại đều được bảo mật.</span>
                  </div>
                ) : (
                  <div className="messages-list">
                    {messages.map((msg, idx) => {
                      const isMe = msg.user_id === currentUserId || msg.sender_id === currentUserId;
                      const senderName = msg.sender_name || msg.senderName || "Người dùng";
                      const canDelete = isMe && msg.id && !String(msg.id).startsWith("temp-");
                      const showAvatar = !isMe && (
                        idx === 0 || messages[idx - 1]?.user_id !== msg.user_id
                      );

                      return (
                        <div key={msg.id || idx} className={`msg-bubble-wrapper ${isMe ? "me" : "other"}`}>
                          {!isMe && showAvatar && (
                            <div className={`msg-avatar ${activeTarget.type}`}>
                              {(senderName || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="msg-bubble">
                            {!isMe && showAvatar && (
                              <div className="msg-sender-name">{senderName}</div>
                            )}
                            <div className="msg-content">{msg.content}</div>
                            <span className="msg-time">
                              {msg.created_at
                                ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : ""}
                            </span>
                            {canDelete && (
                              <button
                                type="button"
                                className="msg-delete-btn"
                                onClick={() => handleDeleteMessage(msg.id)}
                                aria-label="Thu hồi tin nhắn"
                                title="Thu hồi tin nhắn"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    className="send-btn"
                    disabled={!inputValue.trim() || isSending}
                  >
                    <FiSend />
                  </button>
                </form>
              </div>
            </>
          ) : selectedContact ? (
            <>
              <div className="chat-header">
                <div className="chat-header-left">
                  <div className={`target-avatar-wrapper small ${selectedContact.type}`}>
                    <div className="target-avatar">
                      {selectedContact.avatar}
                    </div>
                  </div>
                  <div className="chat-header-info">
                    <span className="active-target-name">{selectedContact.name}</span>
                    <span className="active-target-status">{selectedContact.subLabel}</span>
                  </div>
                </div>
              </div>

              <div className="messages-container custom-scroll chat-new-conversation">
                <div className="chat-welcome-box">
                  <div className="welcome-avatar">{selectedContact.avatar}</div>
                  <h3>Bắt đầu cuộc trò chuyện</h3>
                  <p>Gửi tin nhắn để bắt đầu trao đổi với <strong>{selectedContact.name}</strong> ({selectedContact.subLabel})</p>
                  <span className="safety-note">Toàn bộ cuộc hội thoại đều được bảo mật.</span>
                </div>

                <div className="messages-list">
                  {messages.map((msg, idx) => {
                    const isMe = msg.user_id === currentUserId;
                    return (
                      <div key={msg.id || idx} className={`msg-bubble-wrapper ${isMe ? "me" : "other"}`}>
                        <div className="msg-bubble">
                          <div className="msg-content">{msg.content}</div>
                          <span className="msg-time">
                            {msg.created_at
                              ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : ""}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-area">
                <div className="chat-input-toolbar">
                  <button className="tool-btn"><FiPaperclip /></button>
                  <button className="tool-btn"><FiSmile /></button>
                </div>
                <form className="chat-input-form" onSubmit={async (e) => {
                  e.preventDefault();
                  if (!inputValue.trim()) return;
                  await handleStartConversation(selectedContact);
                  // After starting, send message
                  const text = inputValue;
                  setInputValue("");
                  // Start conv then send
                  try {
                    const resp = await managementChatService.startConversation(selectedContact.id);
                    if (resp.success) {
                      const convId = resp.data.conversationId;
                      const msgResp = await managementChatService.sendMessage(convId, text);
                      if (msgResp.success) {
                        setSelectedConversation({
                          id: convId,
                          other_user_id: selectedContact.id,
                          other_full_name: selectedContact.name,
                          other_user_role: selectedContact.type,
                        });
                        setMessages([msgResp.data]);
                      }
                    }
                  } catch (err) {
                    toast.error("Không thể gửi tin nhắn");
                  }
                }}>
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    className="send-btn"
                    disabled={!inputValue.trim() || isSending}
                  >
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
              <p>Chọn một liên hệ từ danh sách bên trái để bắt đầu làm việc và trao đổi thông tin.</p>
              <div className="empty-hints">
                <span><FiUser /> Nhắn tin cho Quản trị viên hoặc Quản lý</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
