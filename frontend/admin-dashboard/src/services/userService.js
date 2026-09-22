import api from "./api";

// Get all users
export const getUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data?.data || [];
};

// Get single user
export const getUserById = async (id) => {
  const users = await getUsers();
  return users.find((user) => user._id === id);
};

// Create user
export const createUser = async (data) => {
  const response = await api.post("/admin/users", data);
  return response.data?.data;
};

// Update user
export const updateUser = async (id, data) => {
  const response = await api.patch(`/admin/users/${id}`, data);
  return response.data?.data;
};

// Delete user
export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};