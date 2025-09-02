import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { chatAPI } from '../../services/chatAPI';

export interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
  metadata?: any;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
  productId?: string;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  isLoading: false,
  error: null,
  isConnected: false,
};

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async () => {
    const response = await chatAPI.getConversations();
    return response;
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId: string) => {
    const response = await chatAPI.getMessages(conversationId);
    return response;
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (messageData: {
    text: string;
    receiverId: string;
    conversationId?: string;
    productId?: string;
  }) => {
    const response = await chatAPI.sendMessage(messageData);
    return response;
  }
);

export const markAsRead = createAsyncThunk(
  'chat/markAsRead',
  async (conversationId: string) => {
    await chatAPI.markAsRead(conversationId);
    return conversationId;
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.currentConversation = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
      // Update conversation last message
      const conversation = state.conversations.find(
        (c) => c.id === action.payload.conversationId
      );
      if (conversation) {
        conversation.lastMessage = action.payload;
        conversation.updatedAt = action.payload.timestamp;
      }
    },
    updateMessageStatus: (state, action: PayloadAction<{ messageId: string; isRead: boolean }>) => {
      const message = state.messages.find((m) => m.id === action.payload.messageId);
      if (message) {
        message.isRead = action.payload.isRead;
      }
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload.conversations;
        state.error = null;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch conversations';
      })
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages;
        state.error = null;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch messages';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload.message);
        // Update conversation
        const conversation = state.conversations.find(
          (c) => c.id === action.payload.conversationId
        );
        if (conversation) {
          conversation.lastMessage = action.payload.message;
          conversation.updatedAt = action.payload.message.timestamp;
        }
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const conversation = state.conversations.find((c) => c.id === action.payload);
        if (conversation) {
          conversation.unreadCount = 0;
        }
        // Mark all messages in current conversation as read
        if (state.currentConversation?.id === action.payload) {
          state.messages.forEach((message) => {
            message.isRead = true;
          });
        }
      });
  },
});

export const {
  setCurrentConversation,
  addMessage,
  updateMessageStatus,
  setConnectionStatus,
  clearMessages,
} = chatSlice.actions;
export default chatSlice.reducer;
