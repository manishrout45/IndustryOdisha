import React, { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Loader2, Newspaper } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import { articlePath, formatRelativeTime } from "../../utils/media";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const fetchRecentNews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.get("/latest-news", {
        params: { limit: 5 },
      });
      const list = res.data?.data ?? res.data;
      setArticles(Array.isArray(list) ? list : []);
    } catch {
      setError("Could not load notifications.");
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentNews();
  }, [fetchRecentNews]);

  useEffect(() => {
    if (!open) return;

    fetchRecentNews();

    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, fetchRecentNews]);

  const handleArticleClick = (article) => {
    setOpen(false);
    navigate(articlePath(article));
  };

  const hasNews = articles.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-slate-100 text-ink-muted transition-colors"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell size={20} />
        {hasNews && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div
          className="notification-dropdown fixed left-1/2 top-[4.75rem] z-[70] w-[min(92vw,22rem)] bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden lg:absolute lg:left-auto lg:right-0 lg:top-full lg:mt-2"
          role="dialog"
          aria-label="Recent news notifications"
        >
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80">
            <h3 className="text-sm font-semibold text-ink">Latest News</h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Recently uploaded stories
            </p>
          </div>

          <div className="max-h-[min(60vh,20rem)] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-8 text-ink-muted">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            )}

            {!loading && error && (
              <p className="px-4 py-6 text-sm text-red-600 text-center">{error}</p>
            )}

            {!loading && !error && articles.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-8 px-4 text-ink-muted">
                <Newspaper size={24} className="opacity-50" />
                <p className="text-sm">No recent news yet.</p>
              </div>
            )}

            {!loading && !error && articles.length > 0 && (
              <ul className="divide-y divide-slate-100">
                {articles.map((article) => (
                  <li key={article._id || article.slug}>
                    <button
                      type="button"
                      onClick={() => handleArticleClick(article)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors group"
                    >
                      <p className="text-sm font-medium text-ink line-clamp-2 group-hover:text-brand transition-colors">
                        {article.title || article.heading || "Untitled"}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {article.category?.name && (
                          <span className="text-[11px] uppercase tracking-wide text-brand font-medium">
                            {article.category.name}
                          </span>
                        )}
                        {article.publishedAt && (
                          <span className="text-[11px] text-ink-muted">
                            {formatRelativeTime(article.publishedAt)}
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
