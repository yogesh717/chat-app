import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("token") || null,
  user: JSON.parse(localStorage.getItem("user")) || null,
  userId: localStorage.getItem("userId") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.userId = user._id || user.id;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userId", user._id || user.id);
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.userId = null;
      localStorage.clear();
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
