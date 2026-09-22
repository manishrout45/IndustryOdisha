import api from "./api";

export const getTags = async () => {
  const response = await api.get("/admin/tags");
  return response.data;
};

export const createTag = async (data) => {
  const response = await api.post("/admin/tags", data);
  return response.data;
};

export const updateTag = async (id, data) => {
  const response = await api.patch(`/admin/tags/${id}`, data);
  return response.data;
};

export const deleteTag = async (id) => {
  const response = await api.delete(`/admin/tags/${id}`);
  return response.data;
};