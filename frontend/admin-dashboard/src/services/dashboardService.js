import api from "./api";
import { getArticles } from "./articleService";
import { getUsers } from "./userService";

export const getDashboardStats = async () => {
  const [analyticsRes, articlesRes, users] = await Promise.all([
    api.get("/admin/analytics?days=30").catch(() => ({ data: { data: {} } })),
    getArticles().catch(() => ({ articles: [] })),
    getUsers().catch(() => []),
  ]);

  const analytics = analyticsRes?.data?.data || {};
  const articles =
    articlesRes?.articles ||
    articlesRes?.data?.articles ||
    [];
  const userList = Array.isArray(users) ? users : users?.data || [];
  const authors = userList.filter((u) =>
    ["author", "admin", "super-admin"].includes(u.role)
  );

  const totalViews = articles.reduce(
    (sum, a) => sum + (a.viewCount || 0),
    0
  );

  return {
    totalArticles: articles.length || analytics.topArticles?.length || 0,
    totalAuthors: authors.length,
    totalUsers: userList.length,
    totalViews: totalViews || analytics.articleViews || 0,
    pageViews: analytics.pageViews || 0,
    articleViews: analytics.articleViews || 0,
    topArticles: analytics.topArticles || [],
    recentEvents: analytics.recentEvents || [],
    published: articles.filter((a) => a.status === "published").length,
    drafts: articles.filter((a) => a.status === "draft").length,
    pending: articles.filter((a) => a.status === "pending").length,
  };
};
