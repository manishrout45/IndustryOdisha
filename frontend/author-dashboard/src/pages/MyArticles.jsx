import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import ArticleTable from "../components/articles/ArticleTable";
import { PageHeader } from "../components/ui/PageUI";
import { getArticles } from "../services/articleService";
import { getCategories } from "../services/categoryService";
import { flattenCategories } from "../utils/categories";

const MyArticles = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
    getCategories()
      .then((res) => {
        const list = res?.data || res?.categories || res || [];
        setCategories(flattenCategories(Array.isArray(list) ? list : []));
      })
      .catch(() => setCategories([]));
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const response = await getArticles();
      const articleList =
        response?.data?.articles ||
        response?.articles ||
        response?.data ||
        [];
      setArticles(Array.isArray(articleList) ? articleList : []);
    } catch (err) {
      console.error(err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesSearch =
        !q ||
        article.title?.toLowerCase().includes(q) ||
        article.excerpt?.toLowerCase().includes(q) ||
        article.category?.name?.toLowerCase().includes(q);

      const catId =
        typeof article.category === "object"
          ? article.category?._id
          : article.category;
      const matchesCategory =
        categoryFilter === "all" || String(catId) === String(categoryFilter);

      const matchesStatus =
        statusFilter === "all" || article.status === statusFilter;

      let matchesDate = true;
      if (dateFilter) {
        const created = new Date(article.createdAt || article.publishedAt);
        const selected = new Date(dateFilter);
        matchesDate =
          created.getFullYear() === selected.getFullYear() &&
          created.getMonth() === selected.getMonth() &&
          created.getDate() === selected.getDate();
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesDate;
    });
  }, [articles, search, categoryFilter, statusFilter, dateFilter]);

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setDateFilter("");
  };

  return (
    <div>
      <PageHeader
        title="My articles"
        subtitle="Search and filter your stories by date, category or status"
        action={
          <Link to="/articles/create" className="cms-btn-accent">
            <Plus size={16} />
            Write story
          </Link>
        }
      />

      <div className="cms-card p-4 mb-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="search"
              placeholder="Search by headline or excerpt…"
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
              <option key={cat._id} value={cat._id}>
                {cat.label || cat.name}
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
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="cms-input w-auto"
            title="Filter by date"
          />

          <button type="button" onClick={resetFilters} className="cms-btn-ghost">
            Reset
          </button>

          <span className="text-xs text-ink-muted ml-auto">
            {filteredArticles.length} of {articles.length}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="cms-card p-10 text-center text-ink-muted">
          Loading articles…
        </div>
      ) : (
        <ArticleTable articles={filteredArticles} onRefresh={loadArticles} />
      )}
    </div>
  );
};

export default MyArticles;
