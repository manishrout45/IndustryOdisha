// src/services/profileService.js

import API from "./api";

// Get logged-in author's profile
export const getProfile = async () => {
  const response = await API.get("/author/profile");
  return response.data?.data;
};

// Update profile
export const updateProfile = async (data) => {
  const response = await API.put("/author/profile", data);
  return response.data;
};