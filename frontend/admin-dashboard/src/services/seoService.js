import api from "./api";

export const getSeo = async () => {
  const response = await api.get("/admin/seo");
  return response.data?.data || response.data;
};

export const updateSeo = async (data) => {
  const response = await api.patch("/admin/seo", data);
  return response.data?.data || response.data;
};
