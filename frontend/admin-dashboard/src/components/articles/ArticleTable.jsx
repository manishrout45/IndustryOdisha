import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import {
  getArticles,
  deleteArticle,
  approveArticle,
} from "../../services/articleService";
import { getCategories } from "../../services/categoryService";
import { flattenCategories, articleMatchesCategory } from "../../utils/categories";
import { getImageUrl, formatShortDate } from "../../utils/media";
import { StatusBadge } from "../ui/PageUI";

function ArticleTable() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    getCategories()
      .then((res) => {
        const list = res?.data || res?.categories || res || [];
        setCategories(flattenCategories(Array.isArray(list) ? list : []));
      })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    fetchArticles(selectedDate);
  }, [selectedDate]);

  const fetchArticles = async (date = "") => {
    try {
      setLoading(true);
      const res = await getArticles(date);
      const articleList = res?.articles || res?.data?.articles || [];
      setArticles(Array.isArray(articleList) ? articleList : []);
    } catch (error) {
      console.error(error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article?")) return;
    try {
      setBusyId(id);
      await deleteArticle(id);
      setArticles((prev) => prev.filter((a) => a._id !== id));
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete article");
    } finally {
      setBusyId(null);
    }
  };

  const handleApprove = async (id) => {
    try {
      setBusyId(id);
      await approveArticle(id);
      setArticles((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: "published" } : a))
      );
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to approve article");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesStatus =
        statusFilter === "all" || article.status === statusFilter;
      const matchesCategory = articleMatchesCategory(
        article,
        categoryFilter,
        categories
      );
      const matchesSearch =
        !q ||
        article.title?.toLowerCase().includes(q) ||
        article.excerpt?.toLowerCase().includes(q) ||
        article.category?.name?.toLowerCase().includes(q) ||
        article.author?.name?.toLowerCase().includes(q);
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [articles, statusFilter, categoryFilter, search, categories]);

  const resetFilters = () => {
    setSelectedDate("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setSearch("");
  };

  if (loading) {
    return (
      <div className="cms-card p-10 text-center text-ink-muted">
        Loading articles…
      </div>
    );
  }

  return (
    <>
      <div className="cms-card p-4 mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              placeholder="Search headline, excerpt, category, author…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="cms-input pl-9"
            />
          </div>

          <select
            className="cms-input w-auto min-w-[150px]"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((cat) => (
              <option
                key={`${cat.source || "cat"}-${cat._id}`}
                value={cat._id}
              >
                {cat.label || cat.name}
                {cat.source === "wordpress-mysql" ? " (WP)" : ""}
              </option>
            ))}
          </select>

          <select
            className="cms-input w-auto"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="cms-input w-auto"
            title="Filter by created date"
          />

          <button type="button" onClick={resetFilters} className="cms-btn-ghost">
            Reset
          </button>

          <span className="text-xs text-ink-muted ml-auto">
            {filtered.length} of {articles.length} stories
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="cms-card p-10 text-center text-ink-muted">
            No articles match your filters
          </div>
        ) : (
          filtered.map((article) => (
            <article
              key={article._id}
              className="cms-card p-3 sm:p-4 flex flex-col sm:flex-row gap-4"
            >
              <img
                src={getImageUrl(article.featuredImage)}
                alt=""
                className="w-full sm:w-36 h-40 sm:h-24 object-cover rounded-lg border border-slate-200 bg-slate-100 shrink-0"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://placehold.co/160x100?text=No+Image";
                }}
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-accent">
                    {article.category?.name || "News"}
                  </span>
                  <StatusBadge status={article.status} />
                  <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    WordPress
                  </span>
                  {article.isDontMiss ? (
                    <span className="text-[10px] font-bold uppercase bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full">
                      Don't Miss
                    </span>
                  ) : null}
                  {article.isBreaking ? (
                    <span className="text-[10px] font-bold uppercase bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                      Breaking
                    </span>
                  ) : null}
                  {article.isFeatured ? (
                    <span className="text-[10px] font-bold uppercase bg-ink/5 text-ink px-2 py-0.5 rounded-full">
                      Top News
                    </span>
                  ) : null}
                  {article.isTrending ? (
                    <span className="text-[10px] font-bold uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                      Trending
                    </span>
                  ) : null}
                </div>

                <h3 className="font-display font-bold text-ink text-lg leading-snug line-clamp-2">
                  {article.title}
                </h3>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
                  <span>{article.author?.name || "Staff"}</span>
                  <span>{formatShortDate(article.createdAt)}</span>
                  <span>{article.viewCount ?? 0} views</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedArticle(article)}
                    className="cms-btn-ghost text-xs py-1.5"
                  >
                    Preview
                  </button>
                  <Link
                    to={`/articles/edit/${article._id}`}
                    className="cms-btn-primary text-xs py-1.5"
                  >
                    Edit
                  </Link>
                  {(article.status === "pending" ||
                    article.status === "draft") && (
                    <button
                      type="button"
                      disabled={busyId === article._id}
                      onClick={() => handleApprove(article._id)}
                      className="cms-btn text-xs py-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Approve & publish
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busyId === article._id}
                    onClick={() => handleDelete(article._id)}
                    className="cms-btn-danger text-xs py-1.5"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {selectedArticle ? (
        <div className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl">
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex justify-between items-center">
              <h2 className="font-semibold text-ink">Article preview</h2>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="cms-btn-ghost"
              >
                Close
              </button>
            </div>
            <div className="p-6 md:p-8">
              <img
                src={getImageUrl(selectedArticle.featuredImage)}
                alt=""
                className="w-full max-h-[360px] object-cover rounded-lg mb-5 bg-slate-100"
              />
              <StatusBadge status={selectedArticle.status} />
              <h1 className="font-display text-3xl font-bold mt-3 mb-3">
                {selectedArticle.title}
              </h1>
              <p className="text-sm text-ink-muted mb-6">
                By {selectedArticle.author?.name || "Admin"} ·{" "}
                {selectedArticle.viewCount || 0} views
              </p>
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html:
                    selectedArticle.content || "<p>No content available</p>",
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default ArticleTable;
