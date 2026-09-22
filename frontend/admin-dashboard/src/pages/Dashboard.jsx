import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  PenLine,
  Users,
  Eye,
  Plus,
  ArrowRight,
} from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { PageHeader, StatCard, StatusBadge } from "../components/ui/PageUI";
import { getDashboardStats } from "../services/dashboardService";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <PageHeader
        title="Newsroom overview"
        subtitle="Publishing health for the last 30 days"
        action={
          <Link to="/articles/create" className="cms-btn-accent">
            <Plus size={16} />
            New article
          </Link>
        }
      />

      {loading ? (
        <div className="cms-card p-10 text-center text-ink-muted">
          Loading dashboard…
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Articles"
              value={stats?.totalArticles}
              hint={`${stats?.published || 0} published · ${stats?.drafts || 0} drafts`}
              icon={FileText}
              tone="ink"
            />
            <StatCard
              label="Authors"
              value={stats?.totalAuthors}
              hint="Editorial team"
              icon={PenLine}
              tone="accent"
            />
            <StatCard
              label="Users"
              value={stats?.totalUsers}
              hint="All roles"
              icon={Users}
              tone="green"
            />
            <StatCard
              label="Total views"
              value={stats?.totalViews}
              hint={`${stats?.articleViews || 0} tracked views (30d)`}
              icon={Eye}
              tone="amber"
            />
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            <section className="lg:col-span-7 cms-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-ink">Top stories</h2>
                <Link
                  to="/articles"
                  className="text-sm font-semibold text-accent hover:underline inline-flex items-center gap-1"
                >
                  All articles <ArrowRight size={14} />
                </Link>
              </div>

              {(stats?.topArticles || []).length === 0 ? (
                <p className="text-sm text-ink-muted py-8 text-center">
                  No published articles yet. Create your first story.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {(stats.topArticles || []).slice(0, 8).map((article, i) => (
                    <li
                      key={article._id || i}
                      className="py-3 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-ink line-clamp-1">
                          {article.title}
                        </p>
                        <p className="text-xs text-ink-muted mt-1">
                          {article.slug || "—"}
                        </p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-ink shrink-0">
                        {article.viewCount ?? 0} views
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="lg:col-span-5 space-y-6">
              <div className="cms-card p-5">
                <h2 className="font-semibold text-ink mb-4">Workflow</h2>
                <div className="space-y-3">
                  {[
                    { label: "Published", value: stats?.published, status: "published" },
                    { label: "Pending review", value: stats?.pending, status: "pending" },
                    { label: "Drafts", value: stats?.drafts, status: "draft" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-ink-muted">{row.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold tabular-nums">{row.value || 0}</span>
                        <StatusBadge status={row.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="cms-card p-5">
                <h2 className="font-semibold text-ink mb-3">Quick links</h2>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { to: "/articles", label: "Articles" },
                    { to: "/media-library", label: "Media" },
                    { to: "/categories", label: "Categories" },
                    { to: "/homepage-builder", label: "Homepage" },
                    { to: "/seo", label: "SEO" },
                    { to: "/analytics", label: "Analytics" },
                  ].map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium hover:border-ink hover:bg-slate-50 transition"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

export default Dashboard;
