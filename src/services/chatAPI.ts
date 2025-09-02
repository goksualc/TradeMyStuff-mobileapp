import api from './api';
import { Message, Conversation } from '../store/slices/chatSlice';

export interface SendMessageData {
  text: string;
  receiverId: string;
  conversationId?: string;
  productId?: string;
}

export interface SendMessageResponse {
  message: Message;
  conversationId: string;
}

export interface ConversationResponse {
  conversations: Conversation[];
}

export interface MessagesResponse {
  messages: Message[];
  conversation: Conversation;
}

export const chatAPI = {
  async getConversations(): Promise<ConversationResponse> {
    const response = await api.get('/chat/conversations');
    return response.data;
  },

  async getMessages(conversationId: string): Promise<MessagesResponse> {
    const response = await api.get(`/chat/conversations/${conversationId}/messages`);
    return response.data;
  },

  async sendMessage(messageData: SendMessageData): Promise<SendMessageResponse> {
    const response = await api.post('/chat/messages', messageData);
    return response.data;
  },

  async markAsRead(conversationId: string): Promise<void> {
    await api.put(`/chat/conversations/${conversationId}/read`);
  },

  async createConversation(participantId: string, productId?: string): Promise<{
    conversation: Conversation;
  }> {
    const response = await api.post('/chat/conversations', {
      participantId,
      productId,
    });
    return response.data;
  },

  async deleteConversation(conversationId: string): Promise<void> {
    await api.delete(`/chat/conversations/${conversationId}`);
  },

  async deleteMessage(messageId: string): Promise<void> {
    await api.delete(`/chat/messages/${messageId}`);
  },

  async updateMessage(
    messageId: string,
    text: string
  ): Promise<{ message: Message }> {
    const response = await api.put(`/chat/messages/${messageId}`, { text });
    return response.data;
  },

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response = await api.get('/chat/unread-count');
    return response.data;
  },

  async markConversationAsRead(conversationId: string): Promise<void> {
    await api.put(`/chat/conversations/${conversationId}/read`);
  },

  async getConversationParticipants(conversationId: string): Promise<{
    participants: Array<{
      id: string;
      username: string;
      avatar?: string;
      isOnline: boolean;
    }>;
  }> {
    const response = await api.get(`/chat/conversations/${conversationId}/participants`);
    return response.data;
  },
};
