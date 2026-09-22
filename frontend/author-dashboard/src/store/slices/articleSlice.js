import { createSlice } from "@reduxjs/toolkit";

const articleSlice = createSlice({
  name: "articles",

  initialState: {
    articles: [],
    loading: false,
    error: null,
  },

  reducers: {
    fetchArticlesStart: (state) => {
      state.loading = true;
    },

    fetchArticlesSuccess: (state, action) => {
      state.loading = false;
      state.articles = action.payload;
    },

    fetchArticlesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchArticlesStart,
  fetchArticlesSuccess,
  fetchArticlesFailure,
} = articleSlice.actions;

export default articleSlice.reducer;