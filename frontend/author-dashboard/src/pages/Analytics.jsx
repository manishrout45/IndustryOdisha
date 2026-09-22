import React, { useEffect, useState } from "react";
import ViewsChart from "../components/analytics/ViewsChart";
import ArticlePerformance from "../components/analytics/ArticlePerformance";
import { PageHeader, StatCard } from "../components/ui/PageUI";
import { getAnalytics } from "../services/analyticsService";
import { Eye, FileText, CheckCircle2 } from "lucide-react";

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnalytics()
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="cms-card p-10 text-center text-ink-muted">
        Loading analytics…
      </div>
    );
  }

  const totalViews = analytics?.totalViews ?? 0;
  const periodViews = analytics?.articleViews ?? 0;
  const published =
    analytics?.publishedArticles ?? analytics?.publishedCount ?? 0;
  const totalPosts = analytics?.totalArticles ?? 0;

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Performance for your posts only — not site-wide totals"
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Your total views"
          value={Number(totalViews).toLocaleString()}
          icon={Eye}
          tone="accent"
        />
        <StatCard
          label={`Views (last ${analytics?.period || 30}d)`}
          value={Number(periodViews).toLocaleString()}
          icon={Eye}
        />
        <StatCard
          label="Your published posts"
          value={`${published} / ${totalPosts}`}
          icon={CheckCircle2}
          tone="green"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="cms-card p-5">
          <h3 className="font-semibold text-ink mb-1">Your views over time</h3>
          <p className="text-xs text-ink-muted mb-4">
            Based on readers opening your articles
          </p>
          <ViewsChart data={analytics?.monthlyViews || []} />
        </div>
        <div className="cms-card p-5">
          <ArticlePerformance articles={analytics?.topArticles || []} />
        </div>
      </div>

      {!totalPosts ? (
        <div className="cms-card p-6 mt-6 text-center text-sm text-ink-muted">
          <FileText className="mx-auto mb-2 opacity-50" size={28} />
          You have no posts yet. Publish a story to start seeing analytics.
        </div>
      ) : null}
    </div>
  );
};

export default Analytics;
