/**
 * Management Chat Service
 * API calls for Admin ↔ Manager, Manager ↔ Manager chat
 */
import axiosClient from "../../../shared/http/axiosClient";

const MANAGEMENT_CHAT_ENDPOINT = "/chat/management";

const managementChatService = {
  /**
   * Get contacts the current user can message.
   * Permissions are enforced server-side based on role.
   */
  getContacts: async () => {
    return axiosClient.get(`${MANAGEMENT_CHAT_ENDPOINT}/contacts`);
  },

  /**
   * Get list of management conversations.
   */
  getConversations: async (params = {}) => {
    return axiosClient.get(`${MANAGEMENT_CHAT_ENDPOINT}/conversations`, { params });
  },

  /**
   * Get messages in a conversation.
   */
  getMessages: async (conversationId, params = {}) => {
    return axiosClient.get(
      `${MANAGEMENT_CHAT_ENDPOINT}/messages/${conversationId}`,
      { params },
    );
  },

  /**
   * Start or get an existing conversation with a specific user.
   * @param {string} targetId - The user UUID of the recipient
   */
  startConversation: async (targetId) => {
    return axiosClient.post(
      `${MANAGEMENT_CHAT_ENDPOINT}/conversation/start`,
      { targetId },
    );
  },

  /**
   * Send a message in a management conversation.
   */
  sendMessage: async (conversationId, message) => {
    return axiosClient.post(`${MANAGEMENT_CHAT_ENDPOINT}/message`, {
      conversationId,
      message,
    });
  },

  /**
   * Delete a conversation.
   */
  deleteConversation: async (conversationId) => {
    return axiosClient.delete(
      `${MANAGEMENT_CHAT_ENDPOINT}/conversation/${conversationId}`,
    );
  },
};

export default managementChatService;
