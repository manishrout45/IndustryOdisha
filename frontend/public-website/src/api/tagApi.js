import axiosInstance from "../services/axiosInstance";

export const getTags = () =>
  axiosInstance.get("/tags");

export const createTag = (data) =>
  axiosInstance.post("/tags", data);

export const updateTag = (id, data) =>
  axiosInstance.put(`/tags/${id}`, data);

export const deleteTag = (id) =>
  axiosInstance.delete(`/tags/${id}`);