import api from "./api";

export const getComments = async (params = {}) => {
  const response = await api.get("/admin/comments", { params });
  return response.data?.data || response.data;
};

export const moderateComment = async (id, status) => {
  const response = await api.patch(`/admin/comments/${id}/moderate`, {
    status,
  });
  return response.data?.data || response.data;
};

export const deleteComment = async (id) => {
  const response = await api.delete(`/admin/comments/${id}`);
  return response.data;
};
