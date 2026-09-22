import React from "react";
import { Link } from "react-router-dom";

export default function SectionHeading({
  title,
  subtitle,
  to,
  linkLabel = "See all",
}) {
  return (
    <div className="section-heading">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-4 mb-4 sm:mb-5">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="section-accent" aria-hidden />
            <h2 className="font-display text-xl sm:text-2xl md:text-[1.75rem] font-bold text-ink tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle ? (
            <p className="mt-1 ml-4 text-sm text-slate-500">{subtitle}</p>
          ) : null}
        </div>

        {to ? (
          <Link
            to={to}
            className="text-sm font-semibold text-[#0a4caf] hover:text-ink transition shrink-0 self-start sm:self-auto ml-5 sm:ml-0"
          >
            {linkLabel} →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
