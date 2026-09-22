import API from "./api";

// Upload Media
export const uploadMedia = async (formData) => {
  const response = await API.post(
    "/author/media",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// Get Media Library
export const getMediaFiles = async () => {
  const response = await API.get("/author/media");

  return response.data?.data?.media || [];
};

// Delete Media
export const deleteMedia = async (id) => {
  const response = await API.delete(`/author/media/${id}`);

  return response.data;
};