import React, { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthorInfo from "./AuthorInfo";
import ShareButtons from "./ShareButtons";
import ImageLightbox from "./ImageLightbox";
import BrandLogoBadge from "../common/BrandLogoBadge";
import { getImageUrl, articlePath, rewriteArticleHtml, toAppPath } from "../../utils/media";
import ArticleEditLink from "./ArticleEditLink";

function roleLabel(role) {
  if (role === "author") return "Correspondent";
  if (role === "admin" || role === "super-admin") return "Editor";
  return "Staff Reporter";
}

function ArticleDetails({ article, alsoRead }) {
  const navigate = useNavigate();
  const [lightbox, setLightbox] = useState(null);
  const contentHtml = useMemo(
    () => rewriteArticleHtml(article?.content || ""),
    [article?.content]
  );

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const openImage = useCallback((src, alt) => {
    if (!src) return;
    setLightbox({ src, alt: String(alt || "").trim() });
  }, []);

  const handleProseClick = useCallback(
    (event) => {
      const anchor = event.target?.closest?.("a");
      if (anchor && event.currentTarget.contains(anchor)) {
        const modified =
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
        if (!modified && anchor.target !== "_blank") {
          const appPath = toAppPath(anchor.getAttribute("href") || "");
          if (appPath) {
            event.preventDefault();
            navigate(appPath);
            return;
          }
        }
        return;
      }

      const img = event.target?.closest?.("img");
      if (!img || !event.currentTarget.contains(img)) return;
      event.preventDefault();
      openImage(img.currentSrc || img.src, img.getAttribute("alt") || "");
    },
    [navigate, openImage]
  );

  if (!article) return null;

  const image = article.featuredImage || article.image;
  const featuredAlt =
    article.featuredImageAlt ||
    article.seo?.featuredAlt ||
    article.imageCaption ||
    article.title ||
    "";
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
              to={`/${article.category.slug}`}
              className="hover:text-accent transition"
            >
              {article.category.name}
            </Link>
          </>
        ) : null}
        {article.slug || article._id ? (
          <>
            <span className="text-slate-300 font-normal">/</span>
            <Link
              to={articlePath(article)}
              className="hover:text-accent transition"
            >
              {article.slug || article._id}
            </Link>
          </>
        ) : null}
      </nav>

      <header className="mb-6">
        {article.category?.name ? (
          article.category.slug ? (
            <Link
              to={`/${article.category.slug}`}
              className="inline-flex items-center gap-2 mb-3"
            >
              <span className="w-1 h-3.5 bg-accent" aria-hidden />
              <span className="text-accent text-[11px] font-bold uppercase tracking-[0.18em]">
                {article.category.name}
              </span>
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-1 h-3.5 bg-accent" aria-hidden />
              <span className="text-accent text-[11px] font-bold uppercase tracking-[0.18em]">
                {article.category.name}
              </span>
            </div>
          )
        ) : null}

        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-[1.65rem] sm:text-[2rem] lg:text-[2.25rem] font-bold text-ink leading-[1.2] tracking-[-0.015em]">
            {article.title}
          </h1>
          <ArticleEditLink article={article} className="mt-1 shrink-0" />
        </div>

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
          </div>
          <div className="min-w-0">
            <ShareButtons title={article.title} />
          </div>
        </div>
      </header>

      {image ? (
        <figure className="mb-6">
          <button
            type="button"
            className="relative block w-full p-0 border-0 bg-transparent cursor-zoom-in overflow-hidden"
            onClick={() => openImage(getImageUrl(image), featuredAlt)}
            aria-label="View full image"
          >
            <img
              src={getImageUrl(image)}
              alt={featuredAlt || article.title}
              className="w-full aspect-[16/9] max-h-[280px] sm:max-h-[380px] md:max-h-[480px] object-cover bg-slate-100 pointer-events-none"
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/1200x675?text=Industry+Odisha";
              }}
            />
            <BrandLogoBadge size="lg" />
          </button>
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
        dangerouslySetInnerHTML={{ __html: contentHtml }}
        onClick={handleProseClick}
      />

      {alsoRead ? (
        <aside className="my-8 p-4 sm:p-5 bg-slate-50 border border-slate-200/90 border-l-[3px] border-l-accent">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent mb-1.5">
            Also read
          </p>
          <Link
            to={articlePath(alsoRead)}
            className="flex items-start gap-3 group"
          >
            {alsoRead.featuredImage || alsoRead.image ? (
              <img
                src={getImageUrl(
                  alsoRead.featuredImage || alsoRead.image,
                  ""
                )}
                alt=""
                className="h-16 w-24 sm:h-[4.5rem] sm:w-28 shrink-0 object-cover bg-slate-200"
              />
            ) : null}
            <span className="min-w-0 flex-1">
              <span className="font-display text-base sm:text-lg font-bold text-ink leading-snug group-hover:text-accent transition block">
                {alsoRead.title}
              </span>
              {alsoRead.excerpt ? (
                <span className="mt-1.5 text-[13px] text-ink-muted line-clamp-2 leading-relaxed block">
                  {alsoRead.excerpt}
                </span>
              ) : null}
            </span>
          </Link>
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
            _id: author?._id || author?.id || "",
            id: author?._id || author?.id || "",
            name: authorName,
            avatar: authorAvatar,
            bio: authorBio,
            role: authorRole,
          }}
        />
      </div>

      <ImageLightbox
        src={lightbox?.src}
        alt={lightbox?.alt}
        onClose={closeLightbox}
      />
    </article>
  );
}

export default ArticleDetails;
