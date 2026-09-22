import axiosInstance from "../services/axiosInstance";


export const getHomepage = () =>
  axiosInstance.get("/homepage");

export const getArticles = (params = {}) =>
  axiosInstance.get("/articles", { params });

export const getArticle = (slug, { track = true } = {}) =>
  axiosInstance.get(`/articles/${slug}`, {
    params: { track: track ? "1" : "0" },
  });

export const createArticle = (data) =>
  axiosInstance.post("/articles", data);

export const updateArticle = (id, data) =>
  axiosInstance.put(`/articles/${id}`, data);

export const deleteArticle = (id) =>
  axiosInstance.delete(`/articles/${id}`);