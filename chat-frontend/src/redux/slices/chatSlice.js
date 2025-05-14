// src/redux/slices/chatSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  receiver: null,
  messages: [],
  typing: false,
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
      state.messages.push(action.payload);
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
  },
});

export const { setReceiver, setMessages, addMessage, updateMessage, setTyping } = chatSlice.actions;
export default chatSlice.reducer;
