import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { PageHeader, StatCard, EmptyState } from "../components/ui/PageUI";
import { Eye, MousePointerClick, FileText } from "lucide-react";
import api from "../services/api";

function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/analytics?days=30")
      .then((res) => setStats(res.data?.data || res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <PageHeader
        title="Analytics"
        subtitle="Traffic and top-performing stories (last 30 days)"
      />

      {loading ? (
        <div className="cms-card p-10 text-center text-ink-muted">Loading…</div>
      ) : !stats ? (
        <EmptyState title="No analytics data" description="Views will appear as readers open articles." />
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <StatCard label="Page views" value={stats.pageViews} icon={MousePointerClick} />
            <StatCard label="Article views" value={stats.articleViews} icon={Eye} tone="accent" />
            <StatCard
              label="Top stories tracked"
              value={stats.topArticles?.length || 0}
              icon={FileText}
              tone="green"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <section className="cms-card p-5">
              <h2 className="font-semibold text-ink mb-4">Top articles</h2>
              {(stats.topArticles || []).length === 0 ? (
                <p className="text-sm text-ink-muted">No published articles yet.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {stats.topArticles.map((a) => (
                    <li key={a._id} className="py-3 flex justify-between gap-3">
                      <span className="font-medium line-clamp-1">{a.title}</span>
                      <span className="text-sm tabular-nums shrink-0">
                        {a.viewCount || 0}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="cms-card p-5">
              <h2 className="font-semibold text-ink mb-4">Recent events</h2>
              {(stats.recentEvents || []).length === 0 ? (
                <p className="text-sm text-ink-muted">No events recorded yet.</p>
              ) : (
                <ul className="space-y-3 max-h-[420px] overflow-y-auto">
                  {stats.recentEvents.map((ev) => (
                    <li
                      key={ev._id}
                      className="text-sm border-b border-slate-100 pb-2"
                    >
                      <span className="font-medium capitalize">
                        {(ev.eventType || "event").replace("_", " ")}
                      </span>
                      {ev.article?.title ? (
                        <span className="text-ink-muted"> — {ev.article.title}</span>
                      ) : null}
                      <div className="text-xs text-ink-muted mt-1">
                        {ev.createdAt
                          ? new Date(ev.createdAt).toLocaleString()
                          : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default Analytics;
