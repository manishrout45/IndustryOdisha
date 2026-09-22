import api from "./api";

export const getAuthors = async () => {
  const response = await api.get("/admin/users");
  const users = response.data?.data || response.data || [];
  const list = Array.isArray(users) ? users : [];

  return list
    .filter((u) => ["author", "admin", "super-admin"].includes(u.role))
    .map((u) => {
      const posts = Number(u.postCount ?? u.articleCount ?? 0);
      return {
        ...u,
        postCount: posts,
        articleCount: posts,
      };
    });
};

export const getAuthorById = async (id) => {
  const authors = await getAuthors();
  return authors.find((a) => String(a._id) === String(id)) || null;
};

export const getAuthorPosts = async (authorId, { limit = 2000 } = {}) => {
  const params = new URLSearchParams();
  params.set("author", authorId);
  params.set("limit", String(limit));
  params.set("all", "true");
  const response = await api.get(`/admin/articles?${params.toString()}`);
  const data = response.data?.data || response.data || {};
  const articles = data.articles || data?.data?.articles || [];
  const meta = data.meta || {};
  return {
    articles: Array.isArray(articles) ? articles : [],
    total: meta.total ?? (Array.isArray(articles) ? articles.length : 0),
  };
};

export default { getAuthors, getAuthorById, getAuthorPosts };
