import { useState } from "react";
import "./ParentMessages.css";
import ConversationList from "./components/ConversationList/ConversationList";
import ChatWindow from "./components/ChatWindow/ChatWindow";

const ParentMessages = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [messagesByUser, setMessagesByUser] = useState({});

  const handleSendMessage = () => {
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

    setMessagesByUser((prev) => ({
      ...prev,
      [selectedUser.id]: [...(prev[selectedUser.id] || []), newMessage],
    }));

    console.log("Message sent", {
      userId: selectedUser.id,
      userName: selectedUser.name,
      text: messageText,
      createdAt: newMessage.createdAt,
    });

    setInputValue("");
  };

  return (
    <div className="parent-messages">
      <h1>Tin nhắn</h1>

      <div className="messages-layout">
        <ConversationList onSelect={setSelectedUser} />

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

