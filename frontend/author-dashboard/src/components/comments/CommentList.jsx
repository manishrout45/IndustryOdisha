import React from "react";
import { EmptyState, StatusBadge } from "../ui/PageUI";

const CommentList = ({ comments }) => {
  if (!comments?.length) {
    return (
      <EmptyState
        title="No comments yet"
        description="When readers comment on your stories, they will show up here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <div key={comment._id} className="cms-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h4 className="font-semibold text-ink">
                {comment.user?.name ||
                  comment.author?.name ||
                  comment.name ||
                  "Anonymous"}
              </h4>
              <p className="text-xs text-ink-muted mt-0.5">
                {comment.article?.title
                  ? `On: ${comment.article.title}`
                  : "Your story"}
              </p>
            </div>
            <StatusBadge status={comment.status || "pending"} />
          </div>

          <p className="mt-3 text-sm text-ink leading-relaxed">
            {comment.message || comment.content || comment.text}
          </p>
        </div>
      ))}
    </div>
  );
};

export default CommentList;
