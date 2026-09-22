import React from "react";
import { Link } from "react-router-dom";
import { EmptyState, StatusBadge } from "../ui/PageUI";
import { getImageUrl, formatShortDate } from "../../utils/media";

const DraftList = ({ drafts }) => {
  if (!drafts || drafts.length === 0) {
    return (
      <EmptyState
        title="No drafts"
        description="Start a story and save it as draft to continue later."
        action={
          <Link to="/articles/create" className="cms-btn-accent">
            Write story
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {drafts.map((draft) => (
        <div key={draft._id} className="cms-card overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <img
              src={getImageUrl(
                draft.featuredImage || draft.thumbnail || draft.image
              )}
              alt=""
              className="w-full md:w-44 h-40 object-cover bg-slate-100 shrink-0"
            />

            <div className="flex-1 p-5">
              <h2 className="font-display text-xl font-bold text-ink">
                {draft.title}
              </h2>

              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                  {draft.category?.name || draft.category || "Uncategorized"}
                </span>
                <StatusBadge status={draft.status} />
                <span className="text-xs text-ink-muted">
                  {formatShortDate(draft.createdAt)}
                </span>
              </div>

              {(draft.summary || draft.excerpt) && (
                <p className="text-ink-muted mt-3 line-clamp-2 text-sm">
                  {draft.summary || draft.excerpt}
                </p>
              )}

              <div className="mt-4">
                <Link
                  to={`/articles/edit/${draft._id}`}
                  className="cms-btn-primary"
                >
                  Continue editing
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DraftList;
