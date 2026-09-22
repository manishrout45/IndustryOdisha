import React from "react";
import { Link } from "react-router-dom";

export function PageHeader({ title, subtitle, action, breadcrumbs }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {breadcrumbs?.length ? (
          <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.label} className="flex items-center gap-1.5">
                {i > 0 ? <span>/</span> : null}
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-accent">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-ink">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="font-display text-2xl md:text-3xl font-bold text-ink tracking-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon, tone = "ink" }) {
  const tones = {
    ink: "bg-ink/5 text-ink",
    accent: "bg-accent/10 text-accent",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="cms-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-ink tabular-nums">
            {value ?? 0}
          </p>
          {hint ? <p className="mt-1 text-xs text-ink-muted">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={`rounded-xl p-2.5 ${tones[tone] || tones.ink}`}>
            <Icon size={20} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const map = {
    published: "bg-emerald-50 text-emerald-700 border-emerald-200",
    draft: "bg-amber-50 text-amber-700 border-amber-200",
    pending: "bg-sky-50 text-sky-700 border-sky-200",
    archived: "bg-slate-100 text-slate-600 border-slate-200",
  };
  const key = (status || "").toLowerCase();
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
        map[key] || "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {status || "—"}
    </span>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="cms-card px-6 py-14 text-center">
      <p className="font-semibold text-ink">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-ink-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
