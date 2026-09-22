import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // allow cookies
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("authorToken");

  // Only send a REAL JWT
  if (
    token &&
    token !== "jwt-token" &&
    token !== "undefined" &&
    token !== "null"
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

export default API;