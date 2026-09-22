import api from "./api";

export const getArticles = async () => {
  const response = await api.get("/author/articles?limit=2000");
  return response.data;
};

export const getArticleById = async (id) => {
  const response = await api.get(`/author/articles/${id}`);
  return response.data;
};

export const createArticle = async (formData) => {
  const response = await api.post(
    "/author/articles",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const updateArticle = async (id, formData) => {
  const response = await api.patch(
    `/author/articles/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const deleteArticle = async (id) => {
  const response = await api.delete(`/author/articles/${id}`);
  return response.data;
};