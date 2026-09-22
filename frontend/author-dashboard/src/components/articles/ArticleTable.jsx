import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteArticle } from "../../services/articleService";
import { EmptyState, StatusBadge } from "../ui/PageUI";
import { getImageUrl, formatShortDate } from "../../utils/media";

const ArticleTable = ({ articles, onRefresh }) => {
  const [selected, setSelected] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this article?")) return;
    try {
      setBusyId(id);
      await deleteArticle(id);
      onRefresh?.();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete article");
    } finally {
      setBusyId(null);
    }
  };

  const list = useMemo(
    () => (Array.isArray(articles) ? articles : []),
    [articles]
  );

  if (!list.length) {
    return (
      <EmptyState
        title="No articles found"
        description="Start writing — drafts stay here until you publish."
        action={
          <Link to="/articles/create" className="cms-btn-accent">
            Write story
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="space-y-3">
        {list.map((article) => {
          const id = article._id || article.id;
          return (
            <article
              key={id}
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
                    {article.category?.name || article.category || "News"}
                  </span>
                  <StatusBadge status={article.status} />
                  <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    WordPress
                  </span>
                  {article.isBreaking ? (
                    <span className="text-[10px] font-bold uppercase bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                      Breaking
                    </span>
                  ) : null}
                  {article.isFeatured ? (
                    <span className="text-[10px] font-bold uppercase bg-ink/5 text-ink px-2 py-0.5 rounded-full">
                      Featured
                    </span>
                  ) : null}
                </div>

                <h3 className="font-display font-bold text-ink text-lg leading-snug line-clamp-2">
                  {article.title}
                </h3>

                {article.excerpt ? (
                  <p className="text-sm text-ink-muted mt-1 line-clamp-2">
                    {article.excerpt}
                  </p>
                ) : null}

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
                  <span>
                    {formatShortDate(article.publishedAt || article.createdAt)}
                  </span>
                  <span>{article.viewCount ?? 0} views</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelected(article)}
                    className="cms-btn-ghost text-xs py-1.5"
                  >
                    Preview
                  </button>
                  <Link
                    to={`/articles/edit/${id}`}
                    className="cms-btn-primary text-xs py-1.5"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    disabled={busyId === id}
                    onClick={() => handleDelete(id)}
                    className="cms-btn-danger text-xs py-1.5"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 bg-ink/60 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl">
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex justify-between">
              <h2 className="font-semibold">Preview</h2>
              <button
                type="button"
                className="cms-btn-ghost"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
            <div className="p-6">
              <img
                src={getImageUrl(selected.featuredImage)}
                alt=""
                className="w-full max-h-72 object-cover rounded-lg mb-4"
              />
              <h1 className="font-display text-2xl font-bold mb-3">
                {selected.title}
              </h1>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: selected.content || "<p>No content</p>",
                }}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default ArticleTable;
