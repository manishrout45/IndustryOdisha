import API from "./api";

export const getComments = async () => {
  const response = await API.get("/author/comments");
  return response.data;
};
