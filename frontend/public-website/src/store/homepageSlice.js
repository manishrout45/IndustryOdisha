import { createSlice } from "@reduxjs/toolkit";

const homepageSlice = createSlice({
  name: "homepage",

  initialState: {
    featured: [],
    latest: [],
    trending: [],
    breaking: [],
  },

  reducers: {
    setFeatured: (state, action) => {
      state.featured = action.payload;
    },

    setLatest: (state, action) => {
      state.latest = action.payload;
    },

    setTrending: (state, action) => {
      state.trending = action.payload;
    },

    setBreaking: (state, action) => {
      state.breaking = action.payload;
    },
  },
});

export const {
  setFeatured,
  setLatest,
  setTrending,
  setBreaking,
} = homepageSlice.actions;

export default homepageSlice.reducer;