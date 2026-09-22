import api from "./api";

export const getArticles = async (date = "", extra = {}) => {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  // Pull a large merged page so WordPress + Mongo stories appear in the CMS list
  if (!extra.limit) params.set("limit", "2000");
  Object.entries(extra).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });
  const qs = params.toString();
  const response = await api.get(`/admin/articles${qs ? `?${qs}` : ""}`);
  return response.data;
};

export const getArticleById = async (id) => {
  const response = await api.get(`/admin/articles/${id}`);
  return response.data;
};

export const createArticle = async (formData) => {
  const response = await api.post("/admin/articles", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateArticle = async (id, formData) => {
  const response = await api.patch(`/admin/articles/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteArticle = async (id) => {
  const response = await api.delete(`/admin/articles/${id}`);
  return response.data;
};

export const approveArticle = async (id) => {
  const response = await api.patch(`/admin/articles/${id}/approve`);
  return response.data;
};
