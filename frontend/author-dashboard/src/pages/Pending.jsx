import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "../components/ui/PageUI";
import ArticleTable from "../components/articles/ArticleTable";
import { getArticles } from "../services/articleService";
import { getCategories } from "../services/categoryService";
import { flattenCategories } from "../utils/categories";

const Pending = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const response = await getArticles();
      const list =
        response?.data?.articles ||
        response?.articles ||
        response?.data ||
        [];
      setArticles(
        (Array.isArray(list) ? list : []).filter(
          (a) => a.status === "pending"
        )
      );
    } catch (err) {
      console.error(err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    getCategories()
      .then((res) => {
        const list = res?.data || res?.categories || res || [];
        setCategories(flattenCategories(Array.isArray(list) ? list : []));
      })
      .catch(() => setCategories([]));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((article) => {
      const matchesSearch =
        !q || article.title?.toLowerCase().includes(q);
      const catId =
        typeof article.category === "object"
          ? article.category?._id
          : article.category;
      const matchesCategory =
        categoryFilter === "all" || String(catId) === String(categoryFilter);
      let matchesDate = true;
      if (dateFilter) {
        const created = new Date(article.createdAt);
        const selected = new Date(dateFilter);
        matchesDate =
          created.getFullYear() === selected.getFullYear() &&
          created.getMonth() === selected.getMonth() &&
          created.getDate() === selected.getDate();
      }
      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [articles, search, categoryFilter, dateFilter]);

  return (
    <div>
      <PageHeader
        title="Pending review"
        subtitle="Search and filter stories waiting for approval"
        action={
          <Link to="/articles/create" className="cms-btn-accent">
            <Plus size={16} />
            Write story
          </Link>
        }
      />

      <div className="cms-card p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pending…"
            className="cms-input pl-9"
          />
        </div>
        <select
          className="cms-input w-auto min-w-[140px]"
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
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="cms-input w-auto"
        />
        <button
          type="button"
          className="cms-btn-ghost"
          onClick={() => {
            setSearch("");
            setCategoryFilter("all");
            setDateFilter("");
          }}
        >
          Reset
        </button>
      </div>

      {loading ? (
        <div className="cms-card p-10 text-center text-ink-muted">
          Loading…
        </div>
      ) : (
        <ArticleTable articles={filtered} onRefresh={load} />
      )}
    </div>
  );
};

export default Pending;
