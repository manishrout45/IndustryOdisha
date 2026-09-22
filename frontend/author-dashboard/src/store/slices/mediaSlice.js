import { createSlice } from "@reduxjs/toolkit";

const mediaSlice = createSlice({
  name: "media",

  initialState: {
    files: [],
    loading: false,
  },

  reducers: {
    setMedia: (state, action) => {
      state.files = action.payload;
    },

    addMedia: (state, action) => {
      state.files.push(action.payload);
    },
  },
});

export const {
  setMedia,
  addMedia,
} = mediaSlice.actions;

export default mediaSlice.reducer;