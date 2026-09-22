import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { PageHeader, EmptyState, StatusBadge } from "../components/ui/PageUI";
import {
  getComments,
  moderateComment,
  deleteComment,
} from "../services/commentService";

function Comments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getComments();
      const list = data?.comments || data?.data || data || [];
      setComments(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleModerate = async (id, status) => {
    try {
      setBusyId(id);
      await moderateComment(id, status);
      setComments((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status } : c))
      );
    } catch (err) {
      alert(err?.response?.data?.message || "Moderation failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      setBusyId(id);
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const filtered =
    filter === "all"
      ? comments
      : comments.filter((c) => c.status === filter);

  return (
    <DashboardLayout>
      <PageHeader
        title="Comments"
        subtitle="Moderate reader comments before they go live"
        action={
          <select
            className="cms-input w-auto"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        }
      />

      {loading ? (
        <div className="cms-card p-10 text-center text-ink-muted">
          Loading comments…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No comments"
          description="Reader comments will appear here for moderation."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((comment) => (
            <div key={comment._id} className="cms-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">
                    {comment.author?.name ||
                      comment.user?.name ||
                      comment.name ||
                      "Anonymous"}
                  </p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {comment.article?.title
                      ? `On: ${comment.article.title}`
                      : "General"}
                    {comment.createdAt
                      ? ` · ${new Date(comment.createdAt).toLocaleString()}`
                      : ""}
                  </p>
                </div>
                <StatusBadge status={comment.status || "pending"} />
              </div>

              <p className="mt-3 text-sm text-ink leading-relaxed">
                {comment.content || comment.message || comment.text}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {comment.status !== "approved" ? (
                  <button
                    type="button"
                    disabled={busyId === comment._id}
                    onClick={() => handleModerate(comment._id, "approved")}
                    className="cms-btn text-xs py-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                ) : null}
                {comment.status !== "rejected" ? (
                  <button
                    type="button"
                    disabled={busyId === comment._id}
                    onClick={() => handleModerate(comment._id, "rejected")}
                    className="cms-btn-ghost text-xs py-1.5"
                  >
                    Reject
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={busyId === comment._id}
                  onClick={() => handleDelete(comment._id)}
                  className="cms-btn-danger text-xs py-1.5"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default Comments;
