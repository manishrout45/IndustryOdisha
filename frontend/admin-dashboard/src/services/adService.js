import api from "./api";

export const getAds = async () => {
  const res = await api.get("/admin/ads");
  const data = res.data?.data || res.data || [];
  return Array.isArray(data) ? data : data?.ads || [];
};

export const createAd = async (data, imageFile) => {
  const formData = new FormData();
  formData.append("title", data.title || "");
  formData.append("targetUrl", data.targetUrl || "");
  formData.append("isActive", String(data.isActive !== false));
  formData.append("allPositions", String(Boolean(data.allPositions)));
  formData.append(
    "positions",
    JSON.stringify(Array.isArray(data.positions) ? data.positions : [])
  );
  if (imageFile) formData.append("image", imageFile);

  const res = await api.post("/admin/ads", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data || res.data;
};

export const updateAd = async (id, data, imageFile) => {
  if (imageFile || data?.positions || data?.allPositions !== undefined) {
    const formData = new FormData();
    Object.entries(data || {}).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === "positions") {
        formData.append("positions", JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });
    if (imageFile) formData.append("image", imageFile);
    const res = await api.patch(`/admin/ads/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data || res.data;
  }

  const res = await api.patch(`/admin/ads/${id}`, data);
  return res.data?.data || res.data;
};

export const deleteAd = async (id) => {
  const res = await api.delete(`/admin/ads/${id}`);
  return res.data;
};
