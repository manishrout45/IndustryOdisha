import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Search, X } from "lucide-react";
import { formatShortDate, getImageUrl } from "../../utils/media";

function publicArticlesBase() {
  const base = String(import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
  return base.endsWith("/public") ? base : `${base}/public`;
}

function unwrapList(res) {
  const data = res?.data;
  const list =
    data?.data?.articles ||
    data?.articles ||
    data?.data ||
    [];
  return Array.isArray(list) ? list : [];
}

function unwrapMeta(res) {
  return res?.data?.data?.meta || res?.data?.meta || {};
}

function byPublishDateDesc(a, b) {
  const da = new Date(
    a.publishedAt || a.createdAt || a.updatedAt || 0
  ).getTime();
  const db = new Date(
    b.publishedAt || b.createdAt || b.updatedAt || 0
  ).getTime();
  return db - da;
}

/** Fetch every published title match, newest first (paginated). */
async function fetchAllSearchMatches(query, excludeId = "") {
  const pageSize = 100;
  const collected = [];
  const seen = new Set();
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const res = await axios.get(`${publicArticlesBase()}/articles`, {
      params: { search: query, limit: pageSize, page, sort: "date" },
    });
    const list = unwrapList(res);
    const meta = unwrapMeta(res);

    for (const item of list) {
      const id = articleKey(item);
      if (!id || id === String(excludeId || "") || seen.has(id)) continue;
      seen.add(id);
      collected.push(item);
    }

    const total = Number(meta.total || 0);
    const totalPages = Number(meta.totalPages || 0);
    hasMore =
      list.length > 0 &&
      (meta.hasNextPage === true ||
        (totalPages > 0 && page < totalPages) ||
        (total > 0 && collected.length < total && list.length >= pageSize));

    page += 1;
    if (page > 100) break;
  }

  return collected.sort(byPublishDateDesc);
}

function articleKey(item) {
  return String(item?._id || item?.id || "");
}

function ArticleThumb({ article, className = "h-12 w-16" }) {
  const src = getImageUrl(
    article?.featuredImage || article?.image || "",
    ""
  );
  if (!src) {
    return (
      <div
        className={`${className} shrink-0 rounded bg-slate-200/80`}
        aria-hidden
      />
    );
  }
  return (
    <img
      src={src}
      alt=""
      className={`${className} shrink-0 rounded object-cover bg-slate-100`}
    />
  );
}

/**
 * Also-read picker:
 * - same-category suggestions (auto / pick)
 * - search across ALL published articles (any category)
 */
export default function AlsoReadPicker({
  articleId = "",
  categoryId = "",
  mode = "auto",
  selectedId = "",
  initialOptions = [],
  initialSelected = null,
  onChange,
}) {
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedCache, setSelectedCache] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(search.trim()), 220);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!selectedId || mode !== "custom") {
      if (mode !== "custom") setSelectedCache(null);
      return;
    }
    if (
      initialSelected &&
      articleKey(initialSelected) === String(selectedId)
    ) {
      setSelectedCache(initialSelected);
    }
  }, [initialSelected, selectedId, mode]);

  useEffect(() => {
    let cancelled = false;
    if (!categoryId) {
      setCategoryOptions(
        (Array.isArray(initialOptions) ? initialOptions : []).filter(
          (item) => articleKey(item) !== String(articleId || "")
        )
      );
      return undefined;
    }

    axios
      .get(`${publicArticlesBase()}/articles`, {
        params: { category: categoryId, limit: 40 },
      })
      .then((res) => {
        if (cancelled) return;
        const list = unwrapList(res).filter(
          (item) => articleKey(item) !== String(articleId || "")
        );
        setCategoryOptions(list.length ? list : initialOptions || []);
      })
      .catch(() => {
        if (!cancelled) {
          setCategoryOptions(
            (Array.isArray(initialOptions) ? initialOptions : []).filter(
              (item) => articleKey(item) !== String(articleId || "")
            )
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId, articleId, initialOptions]);

  useEffect(() => {
    let cancelled = false;
    if (!debounced) {
      setResults([]);
      setSearching(false);
      return undefined;
    }

    setSearching(true);
    fetchAllSearchMatches(debounced, articleId)
      .then((list) => {
        if (!cancelled) setResults(list);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debounced, articleId]);

  const selectedArticle = useMemo(() => {
    if (mode !== "custom" || !selectedId) return null;
    if (selectedCache && articleKey(selectedCache) === String(selectedId)) {
      return selectedCache;
    }
    const pools = [
      ...(initialSelected ? [initialSelected] : []),
      ...results,
      ...categoryOptions,
      ...(initialOptions || []),
    ];
    return pools.find((item) => articleKey(item) === String(selectedId)) || null;
  }, [
    mode,
    selectedId,
    selectedCache,
    initialSelected,
    results,
    categoryOptions,
    initialOptions,
  ]);

  const pick = (item) => {
    const id = articleKey(item);
    if (!id) return;
    setSelectedCache(item);
    onChange?.({ mode: "custom", id });
    setSearch("");
    setDebounced("");
    setResults([]);
  };

  const dropdownOptions = useMemo(() => {
    const map = new Map();
    for (const item of categoryOptions) {
      const id = articleKey(item);
      if (id) map.set(id, item);
    }
    if (selectedArticle) {
      const id = articleKey(selectedArticle);
      if (id && !map.has(id)) map.set(id, selectedArticle);
    }
    return [...map.values()];
  }, [categoryOptions, selectedArticle]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-700">Also read</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Same-category suggestions, or search any published article
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedCache(null);
            onChange?.({ mode: "none", id: "" });
          }}
          className="text-sm font-semibold text-red-600 hover:text-red-700"
        >
          Remove
        </button>
      </div>

      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search all articles by headline…"
          className="w-full border border-slate-200 rounded-lg py-2.5 pl-9 pr-9 bg-white text-sm"
        />
        {search ? (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setDebounced("");
              setResults([]);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {debounced ? (
        <div className="border border-slate-200 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
          {searching ? (
            <p className="px-3 py-2.5 text-sm text-slate-400">
              Searching all matching articles…
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-2.5 text-sm text-slate-400">
              No articles found for “{debounced}”
            </p>
          ) : (
            <ul>
              <li className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 bg-slate-50 border-b border-slate-100 sticky top-0">
                {results.length} article{results.length === 1 ? "" : "s"} · newest
                first
              </li>
              {results.map((item) => {
                const id = articleKey(item);
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => pick(item)}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-start gap-3"
                    >
                      <ArticleThumb article={item} />
                      <span className="min-w-0 flex-1">
                        <span className="font-medium text-slate-800 line-clamp-2">
                          {item.title}
                        </span>
                        <span className="block text-[11px] text-slate-400 mt-0.5">
                          {[
                            item.category?.name,
                            formatShortDate(
                              item.publishedAt || item.createdAt
                            ),
                          ]
                            .filter((part) => part && part !== "—")
                            .join(" · ")}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}

      {mode === "custom" && selectedArticle ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm flex items-start gap-3">
          <ArticleThumb article={selectedArticle} className="h-14 w-20" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
              Selected
            </p>
            <p className="font-medium text-emerald-900 mt-0.5 line-clamp-2">
              {selectedArticle.title}
            </p>
            {selectedArticle.category?.name ? (
              <p className="text-[11px] text-emerald-700/70 mt-0.5">
                {selectedArticle.category.name}
              </p>
            ) : null}
          </div>
        </div>
      ) : mode === "custom" && selectedId ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
          Loading selected article…
        </div>
      ) : null}

      <div>
        <p className="text-xs font-semibold text-slate-500 mb-1.5">
          Same category
        </p>
        <select
          className="w-full border border-slate-200 rounded-lg p-3 bg-white text-sm"
          value={
            mode === "none" ? "" : mode === "custom" ? selectedId : "auto"
          }
          onChange={(e) => {
            const value = e.target.value;
            if (!value) {
              setSelectedCache(null);
              onChange?.({ mode: "none", id: "" });
              return;
            }
            if (value === "auto") {
              setSelectedCache(null);
              onChange?.({ mode: "auto", id: "" });
              return;
            }
            const found =
              categoryOptions.find((item) => articleKey(item) === value) ||
              null;
            setSelectedCache(found);
            onChange?.({ mode: "custom", id: value });
          }}
        >
          <option value="">None</option>
          <option value="auto">
            Auto — {categoryOptions[0]?.title || "latest in this category"}
          </option>
          {dropdownOptions.map((item) => {
            const id = articleKey(item);
            return (
              <option key={id} value={id}>
                {item.title}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}
