import api from "./axios";

export const getHomepageSections = () =>
  api.get("/admin/homepage-sections");

export const ensureHomepageDefaults = () =>
  api.post("/admin/homepage-sections/ensure-defaults");

export const createHomepageSection = (data) =>
  api.post("/admin/homepage-sections", data);

export const updateHomepageSection = (id, data) =>
  api.patch(`/admin/homepage-sections/${id}`, data);

export const deleteHomepageSection = (id) =>
  api.delete(`/admin/homepage-sections/${id}`);

export const reorderHomepageSections = (orderedIds) =>
  api.patch("/admin/homepage-sections/reorder", {
    orderedIds,
  });
