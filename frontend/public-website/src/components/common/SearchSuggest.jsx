import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search as SearchIcon, X } from "lucide-react";
import axiosInstance from "../../services/axiosInstance";
import { articlePath, getImageUrl } from "../../utils/media";

/**
 * Live search with suggested news as the user types.
 * variant: "nav" (compact dark) | "page" (full light)
 */
export default function SearchSuggest({
  variant = "nav",
  initialQuery = "",
  onSubmitSearch,
  className = "",
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (timerRef.current) clearTimeout(timerRef.current);

    if (q.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await axiosInstance.get("/articles", {
          params: { search: q, limit: 6 },
        });
        const list =
          res.data?.data?.articles ||
          res.data?.articles ||
          res.data?.data ||
          [];
        setSuggestions(Array.isArray(list) ? list : []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  const goSearch = (term = query) => {
    const q = term.trim();
    if (!q) return;
    setOpen(false);
    if (onSubmitSearch) {
      onSubmitSearch(q);
      return;
    }
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const isNav = variant === "nav";

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goSearch();
        }}
        className={
          isNav
            ? "flex items-center w-full h-9 bg-white/10 rounded overflow-hidden focus-within:bg-white/15"
            : "flex items-center w-full border border-slate-200 rounded-lg bg-white focus-within:border-ink focus-within:ring-2 focus-within:ring-ink/10"
        }
      >
        <SearchIcon
          size={isNav ? 16 : 18}
          className={
            isNav
              ? "ml-3 text-white/60 flex-shrink-0"
              : "ml-3 text-ink-muted flex-shrink-0"
          }
        />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length || query.trim().length >= 2) setOpen(true);
          }}
          placeholder="Search news…"
          className={
            isNav
              ? "w-full h-full px-2 bg-transparent outline-none text-sm text-white placeholder:text-white/50"
              : "w-full min-w-0 h-11 sm:h-12 px-2 sm:px-3 bg-transparent outline-none text-sm text-ink"
          }
          autoComplete="off"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setOpen(false);
            }}
            className={
              isNav
                ? "px-2 text-white/60 hover:text-white"
                : "px-2 text-ink-muted hover:text-ink shrink-0"
            }
            aria-label="Clear"
          >
            <X size={16} />
          </button>
        ) : null}
        {!isNav ? (
          <button
            type="submit"
            className="shrink-0 mr-1.5 px-3 sm:px-4 py-2 rounded-md bg-ink text-white text-sm font-semibold hover:bg-ink-soft"
          >
            Search
          </button>
        ) : null}
      </form>

      {open && query.trim().length >= 2 ? (
        <div
          className={`absolute left-0 right-0 top-full mt-1 z-50 overflow-hidden border border-slate-200 bg-white shadow-lg ${
            isNav ? "min-w-[280px] lg:min-w-[320px]" : ""
          }`}
        >
          {loading ? (
            <p className="px-4 py-3 text-sm text-ink-muted">Searching…</p>
          ) : suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-ink-muted">
              No suggestions for “{query.trim()}”
            </p>
          ) : (
            <ul>
              {suggestions.map((item) => (
                <li key={item._id}>
                  <Link
                    to={articlePath(item)}
                    onClick={() => setOpen(false)}
                    className="flex gap-3 px-3 py-2.5 hover:bg-slate-50 border-b border-slate-100 last:border-0"
                  >
                    <img
                      src={getImageUrl(item.featuredImage)}
                      alt=""
                      className="w-14 h-11 object-cover bg-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase text-[#0a4caf]">
                        {item.category?.name || "News"}
                      </p>
                      <p className="text-sm font-semibold text-ink line-clamp-2 leading-snug">
                        {item.title}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => goSearch()}
                  className="w-full text-left px-4 py-2.5 text-sm font-semibold text-[#0a4caf] hover:bg-[#f6f9fe]"
                >
                  See all results for “{query.trim()}” →
                </button>
              </li>
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
