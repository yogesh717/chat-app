// src/redux/slices/chatSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  receiver: null,
  messages: [],
  typing: false,
  conversations: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setReceiver(state, action) {
      state.receiver = action.payload;
    },
    setMessages(state, action) {
      state.messages = action.payload;
    },
    addMessage(state, action) {
      const alreadyExists = state.messages.some((m) => m._id === action.payload._id);
      if (!alreadyExists) {
        state.messages.push(action.payload);
      }
    },
    updateMessage(state, action) {
      const index = state.messages.findIndex(m => m._id === action.payload.tempId);
      if (index !== -1) {
        state.messages[index] = action.payload.newMessage;
      }
    },
    setTyping(state, action) {
      state.typing = action.payload;
    },
    setConversations(state, action) {
      state.conversations = action.payload;
    },
    upsertConversation(state, action) {
      const { otherUserId, otherUserInfo, lastMessage, incoming } = action.payload;
      let entry = state.conversations.find((c) => c.user?._id === otherUserId);

      if (!entry) {
        entry = {
          conversationId: null,
          user: otherUserInfo,
          lastMessage,
          unreadCount: 0,
          updatedAt: lastMessage?.createdAt || new Date().toISOString(),
        };
        state.conversations.push(entry);
      } else {
        entry.lastMessage = lastMessage;
        entry.updatedAt = lastMessage?.createdAt || new Date().toISOString();
        if (otherUserInfo) {
          entry.user = { ...entry.user, ...otherUserInfo };
        }
      }

      if (incoming) {
        entry.unreadCount = (entry.unreadCount || 0) + 1;
      }
    },
    resetUnreadForConversation(state, action) {
      const otherUserId = action.payload;
      const entry = state.conversations.find((c) => c.user?._id === otherUserId);
      if (entry) {
        entry.unreadCount = 0;
      }
    },
    markMessageEdited(state, action) {
      const { messageId, message, editedAt } = action.payload;
      const msg = state.messages.find((m) => m._id === messageId);
      if (msg) {
        msg.message = message;
        msg.edited = true;
        msg.editedAt = editedAt;
      }
    },
    markMessageDeleted(state, action) {
      const { messageId, forEveryone } = action.payload;
      if (forEveryone) {
        const msg = state.messages.find((m) => m._id === messageId);
        if (msg) {
          msg.isDeletedForEveryone = true;
        }
      } else {
        state.messages = state.messages.filter((m) => m._id !== messageId);
      }
    },
    setMessageReactions(state, action) {
      const { messageId, reactions } = action.payload;
      const msg = state.messages.find((m) => m._id === messageId);
      if (msg) {
        msg.reactions = reactions;
      }
    },
    setMessagePinned(state, action) {
      const { messageId, isPinned, pinnedBy, pinnedAt } = action.payload;
      const msg = state.messages.find((m) => m._id === messageId);
      if (msg) {
        msg.isPinned = isPinned;
        msg.pinnedBy = pinnedBy;
        msg.pinnedAt = pinnedAt;
      }
    },
    toggleMessageStarred(state, action) {
      const { messageId, userId, starred } = action.payload;
      const msg = state.messages.find((m) => m._id === messageId);
      if (msg) {
        msg.starredBy = msg.starredBy || [];
        if (starred) {
          if (!msg.starredBy.includes(userId)) msg.starredBy.push(userId);
        } else {
          msg.starredBy = msg.starredBy.filter((id) => id !== userId);
        }
      }
    },
  },
});

export const {
  setReceiver,
  setMessages,
  addMessage,
  updateMessage,
  setTyping,
  setConversations,
  upsertConversation,
  resetUnreadForConversation,
  markMessageEdited,
  markMessageDeleted,
  setMessageReactions,
  setMessagePinned,
  toggleMessageStarred,
} = chatSlice.actions;
export default chatSlice.reducer;
