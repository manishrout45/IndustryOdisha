import api from "./api";

const UPLOAD_TIMEOUT_MS = 10 * 60 * 1000; // large video files

export const getVideos = async () => {
  const res = await api.get("/admin/videos");
  const data = res.data?.data || res.data || [];
  return Array.isArray(data) ? data : [];
};

export const createVideo = async (data, videoFile, thumbnailFile) => {
  const formData = new FormData();
  formData.append("title", data.title || "");
  formData.append("categoryLabel", data.categoryLabel || "Video");
  formData.append("description", data.description || "");
  formData.append("order", String(data.order ?? 0));
  formData.append("isActive", String(data.isActive !== false));
  if (videoFile) formData.append("video", videoFile);
  if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

  const res = await api.post("/admin/videos", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: UPLOAD_TIMEOUT_MS,
  });
  return res.data?.data || res.data;
};

export const updateVideo = async (id, data, videoFile, thumbnailFile) => {
  const formData = new FormData();
  Object.entries(data || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "videoUrl" || key === "thumbnailUrl") return;
    formData.append(key, String(value));
  });
  if (videoFile) formData.append("video", videoFile);
  if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

  const res = await api.patch(`/admin/videos/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: UPLOAD_TIMEOUT_MS,
  });
  return res.data?.data || res.data;
};

export const deleteVideo = async (id) => {
  const res = await api.delete(`/admin/videos/${id}`);
  return res.data;
};

export const MAX_VIDEO_BYTES = 120 * 1024 * 1024;
