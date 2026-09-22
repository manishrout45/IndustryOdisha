import api from "./api";

// =======================
// Get Media Library
// =======================
export const getMedia = async () => {
  const response = await api.get("/admin/media");
  return response.data?.data?.media || [];
};

// =======================
// Upload Media
// =======================
export const uploadMedia = async (file, meta = {}) => {
  const formData = new FormData();

  // File
  formData.append("file", file);

  // Optional fields
  formData.append("altText", meta.altText || "");
  formData.append("caption", meta.caption || "");

  const response = await api.post("/admin/media", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

// =======================
// Delete Media
// =======================
export const deleteMedia = async (id) => {
  const response = await api.delete(`/admin/media/${id}`);
  return response.data;
};