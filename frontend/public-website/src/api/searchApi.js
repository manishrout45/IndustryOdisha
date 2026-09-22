import axiosInstance from "../services/axiosInstance";

export const searchArticles = (query) =>
  axiosInstance.get(`/search?q=${query}`);