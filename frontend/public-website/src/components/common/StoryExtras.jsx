import React from "react";
import { Link } from "react-router-dom";
import {
  articlePath,
  formatNewsDate,
  formatRelativeTime,
} from "../../utils/media";

/** Prefer excerpt; fall back to a short plain-text snippet from content */
export function getSubheading(article, maxLen = 140) {
  if (!article) return "";
  const excerpt = String(article.excerpt || "").trim();
  if (excerpt) return excerpt;

  const raw = String(article.content || article.body || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!raw) return "";
  return raw.length > maxLen ? `${raw.slice(0, maxLen).trim()}…` : raw;
}

export function getArticleTags(article) {
  if (!article || !Array.isArray(article.tags)) return [];
  return article.tags.filter(Boolean);
}

export function ArticleTags({ article, limit = 3, light = false, className = "" }) {
  const tags = getArticleTags(article).slice(0, limit);
  if (!tags.length) return null;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {tags.map((tag) => {
        const name = tag.name || tag;
        const slug = tag.slug || tag;
        const key = tag._id || slug || name;
        const chip = (
          <span
            className={
              light
                ? "inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-white/15 text-white/90 border border-white/20"
                : "inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-slate-100 text-ink-muted border border-slate-200/80"
            }
          >
            {name}
          </span>
        );

        if (typeof slug === "string" && slug && !String(slug).includes(" ")) {
          return (
            <Link
              key={key}
              to={`/tag/${slug}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:opacity-80 transition"
            >
              {chip}
            </Link>
          );
        }
        return <span key={key}>{chip}</span>;
      })}
    </div>
  );
}

export function ArticleDate({
  article,
  relative = false,
  light = false,
  className = "",
}) {
  const value = article?.publishedAt || article?.createdAt || article?.date;
  if (!value) return null;
  const text = relative ? formatRelativeTime(value) : formatNewsDate(value);
  if (!text) return null;

  return (
    <time
      dateTime={new Date(value).toISOString()}
      className={`${
        light ? "text-white/65" : "text-ink-muted"
      } text-xs ${className}`}
    >
      {text}
    </time>
  );
}

export function ArticleSubhead({
  article,
  light = false,
  className = "",
}) {
  const text = getSubheading(article);
  if (!text) return null;

  return (
    <p
      className={`line-clamp-2 text-sm leading-relaxed ${
        light ? "text-white/80" : "text-ink-muted"
      } ${className}`}
    >
      {text}
    </p>
  );
}

/**
 * Compact meta row used under titles in list/card layouts.
 * Shows tags, date, 2-line subheading, and Read more.
 */
export function StoryExtras({
  article,
  relativeDate = false,
  light = false,
  showTags = true,
  showDate = true,
  showSubhead = true,
  showReadMore = true,
  className = "",
  subheadClassName = "",
}) {
  if (!article) return null;
  const to = articlePath(article);
  const tags = showTags ? getArticleTags(article) : [];
  const hasTags = tags.length > 0;
  const dateValue =
    article?.publishedAt || article?.createdAt || article?.date;
  const hasDate = showDate && Boolean(dateValue);
  const subhead = showSubhead ? getSubheading(article) : "";

  if (!hasTags && !hasDate && !subhead && !showReadMore) return null;

  return (
    <div className={`mt-2 space-y-2 ${className}`}>
      {(hasTags || hasDate) && (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
          {hasTags ? (
            <ArticleTags article={article} light={light} />
          ) : null}
          {hasTags && hasDate ? (
            <span
              className={
                light ? "text-white/35 text-xs" : "text-slate-300 text-xs"
              }
            >
              ·
            </span>
          ) : null}
          {hasDate ? (
            <ArticleDate
              article={article}
              relative={relativeDate}
              light={light}
            />
          ) : null}
        </div>
      )}

      {subhead ? (
        <p
          className={`line-clamp-2 text-sm leading-relaxed ${
            light ? "text-white/80" : "text-ink-muted"
          } ${subheadClassName}`}
        >
          {subhead}
        </p>
      ) : null}

      {showReadMore ? (
        <Link
          to={to}
          onClick={(e) => e.stopPropagation()}
          className={
            light
              ? "inline-flex items-center text-xs font-bold uppercase tracking-wide text-white hover:text-[#0a4caf] transition"
              : "inline-flex items-center text-xs font-bold uppercase tracking-wide text-[#0a4caf] hover:text-ink transition"
          }
        >
          Read more
          <span aria-hidden className="ml-1">
            →
          </span>
        </Link>
      ) : null}
    </div>
  );
}

export default StoryExtras;
