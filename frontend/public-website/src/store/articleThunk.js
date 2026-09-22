import { createAsyncThunk } from "@reduxjs/toolkit";
import { getArticles } from "../api/articleApi";

export const fetchArticles =
  createAsyncThunk(
    "articles/fetchArticles",
    async () => {
      const response =
        await getArticles();

      return response.data;
    }
  );