import api from "./api";

export const getSubscribers = async () => {
  const res = await api.get("/admin/newsletter/subscribers");
  const data = res.data?.data || res.data || [];
  return Array.isArray(data) ? data : [];
};

export const sendNewsletterNow = async () => {
  const res = await api.post("/admin/newsletter/send");
  return res.data?.data || res.data;
};
