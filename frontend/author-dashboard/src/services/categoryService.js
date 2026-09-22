import api from "./api";

export const getCategories = async () => {
  const response = await api.get("/author/categories");
  return response.data;
};