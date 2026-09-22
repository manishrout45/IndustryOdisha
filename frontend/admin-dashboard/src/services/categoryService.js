import api from "./api";

export const getCategories = async () => {
  const response = await api.get("/admin/categories");
  return response.data;
};

export const createCategory = async (data) => {
  const response = await api.post("/admin/categories", data);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await api.patch(`/admin/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/admin/categories/${id}`);
  return response.data;
};

export const reorderCategories = async ({ orderedIds, parentId = null }) => {
  const response = await api.patch("/admin/categories/reorder", {
    orderedIds,
    parentId,
  });
  return response.data;
};
