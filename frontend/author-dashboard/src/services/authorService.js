import api from "./api";

// Dashboard analytics
export const getAuthorAnalytics = async (days = 30) => {
  const response = await api.get(`/author/analytics?days=${days}`);
  return response.data?.data;
};

// Optional: articles
export const getMyArticles = async () => {
  const response = await api.get("/author/articles");
  return response.data?.data;
};

// Optional: comments
export const getMyComments = async () => {
  const response = await api.get("/author/comments");
  return response.data?.data;
};