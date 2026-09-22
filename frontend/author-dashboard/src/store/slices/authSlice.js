import { createSlice } from "@reduxjs/toolkit";

const token = localStorage.getItem("authorToken");

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: token || null,
    isAuthenticated: !!token,
    loading: false,
  },

  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },

    loginSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      localStorage.setItem(
        "authorToken",
        action.payload.token
      );
    },

    loginFailure: (state) => {
      state.loading = false;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      localStorage.removeItem("authorToken");
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} = authSlice.actions;

export default authSlice.reducer;