import { useState, useEffect } from "react";
import "./ParentMessages.css";
import ConversationList from "./components/ConversationList/ConversationList";
import ChatWindow from "./components/ChatWindow/ChatWindow";
import { parentService } from "../../../services/pages/parent/parentService";

const ParentMessages = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [messagesByUser, setMessagesByUser] = useState({});
  const [conversationList, setConversationList] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Fetch messages from API on component mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const response = await parentService.listMessages({ mock: false });
        console.log("📧 Parent Messages API Response:", response);

        const messages = response.data || response.parent_messages || response || [];
        setConversationList(Array.isArray(messages) ? messages : []);
      } catch (err) {
        console.error("❌ Error fetching parent messages:", err);
        setConversationList([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, []);

  const handleSendMessage = async () => {
    const messageText = inputValue.trim();

    if (!selectedUser || !messageText) {
      return;
    }

    const newMessage = {
      id: Date.now(),
      from: "me",
      text: messageText,
      createdAt: new Date().toISOString(),
    };

    // Update local state
    setMessagesByUser((prev) => ({
      ...prev,
      [selectedUser.id]: [...(prev[selectedUser.id] || []), newMessage],
    }));

    // Send to API
    try {
      const response = await parentService.sendMessage({
        body: {
          userId: selectedUser.id,
          text: messageText,
        },
        mock: false,
      });
      console.log("📤 Message sent via API:", response);
    } catch (err) {
      console.error("❌ Error sending message:", err);
    }

    setInputValue("");
  };

  return (
    <div className="parent-messages">
      <div className="parent-messages-header">
        <h1>Liên lạc giáo viên chủ nhiệm</h1>
        <p>Trao đổi nhanh với giáo viên chủ nhiệm về học tập, điểm danh và tình hình của con.</p>
      </div>

      <div className="messages-layout">
        <ConversationList onSelect={setSelectedUser} conversationList={conversationList} isLoading={isLoadingMessages} />

        <ChatWindow
          user={selectedUser}
          messages={selectedUser ? messagesByUser[selectedUser.id] || [] : []}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSendMessage}
        />
      </div>
    </div>
  );
};

export default ParentMessages;

