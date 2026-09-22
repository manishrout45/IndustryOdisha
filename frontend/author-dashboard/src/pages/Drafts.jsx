import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import DraftList from "../components/articles/DraftList";
import { PageHeader } from "../components/ui/PageUI";
import { getArticles } from "../services/articleService";
import { getCategories } from "../services/categoryService";
import { flattenCategories } from "../utils/categories";

const Drafts = () => {
  const [drafts, setDrafts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const fetchDrafts = async () => {
    try {
      const response = await getArticles();
      const articles =
        response.data?.articles ||
        response.data ||
        response.articles ||
        [];
      setDrafts(
        (Array.isArray(articles) ? articles : []).filter(
          (article) => article.status === "draft"
        )
      );
    } catch (err) {
      console.error(err);
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
    getCategories()
      .then((res) => {
        const list = res?.data || res?.categories || res || [];
        setCategories(flattenCategories(Array.isArray(list) ? list : []));
      })
      .catch(() => setCategories([]));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return drafts.filter((draft) => {
      const matchesSearch =
        !q ||
        draft.title?.toLowerCase().includes(q) ||
        draft.excerpt?.toLowerCase().includes(q);

      const catId =
        typeof draft.category === "object"
          ? draft.category?._id
          : draft.category;
      const matchesCategory =
        categoryFilter === "all" || String(catId) === String(categoryFilter);

      let matchesDate = true;
      if (dateFilter) {
        const created = new Date(draft.createdAt);
        const selected = new Date(dateFilter);
        matchesDate =
          created.getFullYear() === selected.getFullYear() &&
          created.getMonth() === selected.getMonth() &&
          created.getDate() === selected.getDate();
      }

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [drafts, search, categoryFilter, dateFilter]);

  return (
    <div>
      <PageHeader
        title="Drafts"
        subtitle="Search and filter unfinished stories"
        action={
          <Link to="/articles/create" className="cms-btn-accent">
            <Plus size={16} />
            New draft
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
            placeholder="Search drafts…"
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
          Loading drafts…
        </div>
      ) : (
        <DraftList drafts={filtered} />
      )}
    </div>
  );
};

export default Drafts;
