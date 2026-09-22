import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import SearchSuggest from "../components/common/SearchSuggest";
import axiosInstance from "../services/axiosInstance";
import {
  articlePath,
  formatNewsDate,
  getImageUrl,
} from "../utils/media";

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = async (term) => {
    const q = term.trim();
    if (!q) {
      setResults([]);
      setSearched(false);
      return;
    }

    try {
      setLoading(true);
      setSearched(true);
      const res = await axiosInstance.get("/articles", {
        params: { search: q, limit: 24 },
      });
      const list =
        res.data?.data?.articles ||
        res.data?.articles ||
        res.data?.data ||
        [];
      setResults(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (qParam.trim()) runSearch(qParam);
    else {
      setResults([]);
      setSearched(false);
    }
  }, [qParam]);

  return (
    <MainLayout>
      <div className="max-w-site mx-auto px-4 py-8 md:py-12">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-2">
          Search news
        </h1>
        <p className="text-sm text-ink-muted mb-6">
          Suggestions appear as you type — pick a story or see all results
        </p>

        <div className="mb-8 max-w-2xl">
          <SearchSuggest
            variant="page"
            initialQuery={qParam}
            onSubmitSearch={(q) => {
              setSearchParams({ q });
              runSearch(q);
            }}
          />
        </div>

        {loading ? (
          <div className="py-16 text-center text-ink-muted">Searching…</div>
        ) : !searched ? (
          <div className="py-16 text-center text-ink-muted">
            Start typing to see suggested news.
          </div>
        ) : results.length === 0 ? (
          <div className="py-16 text-center text-ink-muted">
            No results for “{qParam}”.
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <p className="text-sm text-ink-muted mb-2">
              {results.length} result{results.length === 1 ? "" : "s"} for “
              {qParam}”
            </p>
            {results.map((item) => (
              <Link
                key={item._id}
                to={articlePath(item)}
                className="flex gap-3 sm:gap-4 p-3 border border-slate-200 bg-white hover:border-accent/40 transition"
              >
                <img
                  src={getImageUrl(item.featuredImage)}
                  alt=""
                  className="w-20 h-16 sm:w-28 sm:h-20 object-cover bg-slate-100 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase text-accent">
                    {item.category?.name || "News"}
                  </span>
                  <h2 className="font-display font-bold text-base sm:text-lg mt-1 line-clamp-2">
                    {item.title}
                  </h2>
                  {item.excerpt ? (
                    <p className="hidden sm:block text-sm text-ink-muted mt-1 line-clamp-2">
                      {item.excerpt}
                    </p>
                  ) : null}
                  <p className="text-xs text-ink-muted mt-2">
                    {formatNewsDate(item.publishedAt || item.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Search;
