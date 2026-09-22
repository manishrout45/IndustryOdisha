import React from "react";

const ArticlePerformance = ({ articles = [] }) => {
  return (
    <div>
      <h3 className="font-semibold text-ink mb-1">Your top posts</h3>
      <p className="text-xs text-ink-muted mb-4">
        Ranked by real view counts on your articles only
      </p>

      {!articles.length ? (
        <p className="text-sm text-ink-muted py-8 text-center">
          No posts to rank yet.
        </p>
      ) : (
        <div className="space-y-3">
          {articles.map((article, index) => (
            <div
              key={article._id || index}
              className="flex justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"
            >
              <div className="min-w-0 flex gap-2">
                <span className="text-ink-muted font-semibold w-5 shrink-0">
                  {index + 1}.
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-ink line-clamp-2 text-sm">
                    {article.title}
                  </p>
                  {article.status ? (
                    <p className="text-[11px] text-ink-muted capitalize mt-0.5">
                      {article.status}
                    </p>
                  ) : null}
                </div>
              </div>
              <span className="font-semibold text-sm tabular-nums shrink-0">
                {Number(article.views ?? article.viewCount ?? 0).toLocaleString()}{" "}
                <span className="font-normal text-ink-muted">views</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArticlePerformance;
