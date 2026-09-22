import axiosInstance from "./axiosInstance";

export const getHomepage = () =>
  axiosInstance.get("/homepage");

export const getFeaturedNews = () =>
  axiosInstance.get("/articles?featured=true&limit=3");

export const getTrendingNews = () =>
  axiosInstance.get("/trending-news?limit=5");