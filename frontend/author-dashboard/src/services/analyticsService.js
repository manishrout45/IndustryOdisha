import API from "./api";

export const getAnalytics = async () => {
  const response = await API.get("/author/analytics");
  return response.data?.data || {};
};