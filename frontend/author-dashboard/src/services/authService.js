import API from "./api";

export const login = async (data) => {
  const response = await API.post("/auth/login", data);

  // Supports both:
  // { token, user }
  // and
  // { data: { token, user } }
  return response.data.data || response.data;
};

export const getProfile = async () => {
  const response = await API.get("/authors/profile");
  return response.data.data || response.data;
};

export const updateProfile = async (data) => {
  const response = await API.put("/authors/profile", data);
  return response.data.data || response.data;
};