import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  CheckCircle2,
  FileEdit,
  Eye,
  Plus,
  ArrowRight,
  Clock3,
} from "lucide-react";
import { PageHeader, StatCard } from "../components/ui/PageUI";
import { getAuthorAnalytics } from "../services/authorService";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    getAuthorAnalytics(30)
      .then(setAnalytics)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="cms-card p-10 text-center text-ink-muted">
        Loading your desk…
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="cms-card p-10 text-center text-red-600">
        Failed to load dashboard. Check your login and API.
      </div>
    );
  }

  const totalArticles =
    analytics.totalArticles ??
    (analytics.publishedArticles || 0) +
      (analytics.draftArticles || 0) +
      (analytics.pendingArticles || 0);
  const published =
    analytics.publishedArticles ?? analytics.publishedCount ?? 0;
  const drafts = analytics.draftArticles ?? analytics.draftCount ?? 0;
  const pending = analytics.pendingArticles ?? 0;
  const totalViews = analytics.totalViews ?? 0;

  return (
    <div>
      <PageHeader
        title="Your newsroom desk"
        subtitle="Only your posts — views and activity from the last 30 days"
        action={
          <Link to="/articles/create" className="cms-btn-accent">
            <Plus size={16} />
            Write story
          </Link>
        }
      />

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Your posts"
          value={totalArticles}
          icon={FileText}
        />
        <StatCard
          label="Published"
          value={published}
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="Drafts"
          value={drafts}
          icon={FileEdit}
          tone="amber"
        />
        <StatCard
          label="Your total views"
          value={Number(totalViews).toLocaleString()}
          icon={Eye}
          tone="accent"
        />
      </div>

      {pending > 0 ? (
        <div className="mb-6 cms-card p-4 flex items-center gap-3 text-sm">
          <Clock3 size={18} className="text-amber-600 shrink-0" />
          <p className="text-ink">
            <span className="font-semibold">{pending}</span> of your posts{" "}
            {pending === 1 ? "is" : "are"} pending review.
          </p>
          <Link
            to="/pending"
            className="ml-auto text-accent font-semibold whitespace-nowrap"
          >
            View pending →
          </Link>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="cms-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-ink">Your recent posts</h2>
            <Link
              to="/articles"
              className="text-sm font-semibold text-accent inline-flex items-center gap-1"
            >
              My articles <ArrowRight size={14} />
            </Link>
          </div>
          <ul className="space-y-3">
            {analytics.recentActivity?.length ? (
              analytics.recentActivity.map((item, i) => (
                <li
                  key={item._id || i}
                  className="border-b border-slate-100 pb-3 text-sm text-ink last:border-0"
                >
                  <p className="font-medium line-clamp-1">
                    {item.title || item.message}
                  </p>
                  <p className="text-xs text-ink-muted mt-0.5 capitalize">
                    {item.status || "post"}
                    {item.viewCount != null
                      ? ` · ${Number(item.viewCount).toLocaleString()} views`
                      : ""}
                  </p>
                </li>
              ))
            ) : (
              <li className="text-sm text-ink-muted py-6 text-center">
                You have no posts yet. Write your first story.
              </li>
            )}
          </ul>
        </section>

        <section className="cms-card p-5">
          <h2 className="font-semibold text-ink mb-4">Quick actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { to: "/articles/create", label: "New story" },
              { to: "/drafts", label: "Continue draft" },
              { to: "/media", label: "Upload media" },
              { to: "/analytics", label: "View analytics" },
              { to: "/comments", label: "Comments" },
              { to: "/profile", label: "Edit profile" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg border border-slate-200 px-3 py-3 text-sm font-medium hover:border-ink hover:bg-slate-50 transition"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-muted">Comments on your posts</span>
              <span className="font-semibold">{analytics.comments || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Your media files</span>
              <span className="font-semibold">{analytics.mediaFiles || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">Views (last {analytics.period || 30}d)</span>
              <span className="font-semibold">
                {Number(analytics.articleViews || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
