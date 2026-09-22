import React from "react";
import { Link } from "react-router-dom";
import AuthorInfo from "./AuthorInfo";
import ShareButtons from "./ShareButtons";
import { getImageUrl, articlePath } from "../../utils/media";

function roleLabel(role) {
  if (role === "author") return "Correspondent";
  if (role === "admin" || role === "super-admin") return "Editor";
  return "Staff Reporter";
}

function ArticleDetails({ article, alsoRead }) {
  if (!article) return null;

  const image = article.featuredImage || article.image;
  const author = typeof article.author === "object" ? article.author : null;
  const authorName = author?.name || "Staff Reporter";
  const authorRole = roleLabel(author?.role);
  const authorBio =
    author?.bio ||
    "Reports for Industry Odisha on politics, policy and public affairs across the state.";
  const authorAvatar = author?.avatar || "";

  return (
    <article className="article-detail">
      <nav className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted mb-5 flex flex-wrap items-center gap-2">
        <Link to="/" className="hover:text-accent transition">
          Home
        </Link>
        {article.category?.slug ? (
          <>
            <span className="text-slate-300 font-normal">/</span>
            <Link
              to={`/category/${article.category.slug}`}
              className="hover:text-accent transition"
            >
              {article.category.name}
            </Link>
          </>
        ) : null}
      </nav>

      <header className="mb-6">
        {article.category?.name ? (
          <Link
            to={`/category/${article.category.slug}`}
            className="inline-flex items-center gap-2 mb-3"
          >
            <span className="w-1 h-3.5 bg-accent" aria-hidden />
            <span className="text-accent text-[11px] font-bold uppercase tracking-[0.18em]">
              {article.category.name}
            </span>
          </Link>
        ) : null}

        <h1 className="font-display text-[1.65rem] sm:text-[2rem] lg:text-[2.25rem] font-bold text-ink leading-[1.2] tracking-[-0.015em]">
          {article.title}
        </h1>

        {article.excerpt ? (
          <p className="mt-3.5 text-[0.95rem] sm:text-[1rem] leading-[1.55] text-ink-muted font-sans">
            {article.excerpt}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-y border-slate-200 py-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 min-w-0 text-[12px] text-ink-muted">
            {Array.isArray(article.tags) && article.tags.length > 0
              ? article.tags.slice(0, 4).map((tag) => (
                  <Link
                    key={tag._id || tag.slug || tag}
                    to={`/tag/${tag.slug || tag}`}
                    className="text-[11px] px-2 py-0.5 bg-slate-100 text-ink-muted hover:bg-accent hover:text-white transition"
                  >
                    {tag.name || tag}
                  </Link>
                ))
              : null}
            <span className="tabular-nums">
              {Number(article.viewCount || 0).toLocaleString()} views
            </span>
          </div>
          <div className="shrink-0">
            <ShareButtons title={article.title} />
          </div>
        </div>
      </header>

      {image ? (
        <figure className="mb-6">
          <img
            src={getImageUrl(image)}
            alt={article.title}
            className="w-full aspect-[16/9] max-h-[280px] sm:max-h-[380px] md:max-h-[480px] object-cover bg-slate-100"
            onError={(e) => {
              e.currentTarget.src =
                "https://placehold.co/1200x675?text=Industry+Odisha";
            }}
          />
          {(article.imageCaption || article.category?.name) && (
            <figcaption className="mt-2 text-[11px] leading-snug text-ink-muted border-l-2 border-slate-300 pl-2.5">
              {article.imageCaption ||
                `${article.category?.name} · Industry Odisha`}
            </figcaption>
          )}
        </figure>
      ) : null}

      <div
        className="article-prose article-prose--detail"
        dangerouslySetInnerHTML={{ __html: article.content || "" }}
      />

      {alsoRead ? (
        <aside className="my-8 p-4 sm:p-5 bg-slate-50 border border-slate-200/90 border-l-[3px] border-l-accent">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent mb-1.5">
            Also read
          </p>
          <Link
            to={articlePath(alsoRead)}
            className="font-display text-base sm:text-lg font-bold text-ink leading-snug hover:text-accent transition block"
          >
            {alsoRead.title}
          </Link>
          {alsoRead.excerpt ? (
            <p className="mt-1.5 text-[13px] text-ink-muted line-clamp-2 leading-relaxed">
              {alsoRead.excerpt}
            </p>
          ) : null}
        </aside>
      ) : null}

      {Array.isArray(article.tags) && article.tags.length > 0 ? (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted mb-2.5">
            Topics
          </p>
          <div className="flex flex-wrap gap-1.5">
            {article.tags.map((tag) => (
              <Link
                key={tag._id || tag.slug || tag}
                to={`/tag/${tag.slug || tag}`}
                className="text-[12px] px-2.5 py-1 bg-slate-100 text-ink hover:bg-accent hover:text-white transition"
              >
                {tag.name || tag}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-8 p-4 sm:p-5 bg-white border border-slate-200">
        <AuthorInfo
          author={{
            name: authorName,
            avatar: authorAvatar,
            bio: authorBio,
            role: authorRole,
          }}
        />
      </div>
    </article>
  );
}

export default ArticleDetails;
