import {
  createSlice,
} from "@reduxjs/toolkit";

import {
  fetchArticles,
} from "./articleThunk";

const articleSlice = createSlice({
  name: "articles",

  initialState: {
    articles: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(
        fetchArticles.pending,
        (state) => {
          state.loading = true;
        }
      )

      .addCase(
        fetchArticles.fulfilled,
        (state, action) => {
          state.loading = false;
          state.articles =
            action.payload;
        }
      )

      .addCase(
        fetchArticles.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.error.message;
        }
      );
  },
});

export default articleSlice.reducer;