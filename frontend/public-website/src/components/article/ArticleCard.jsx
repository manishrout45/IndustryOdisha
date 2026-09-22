import React from "react";
import { Link } from "react-router-dom";
import {
  articlePath,
  getImageUrl,
} from "../../utils/media";
import StoryExtras from "../common/StoryExtras";

function ArticleCard({ article }) {
  if (!article) return null;

  const authorName =
    typeof article.author === "object"
      ? article.author?.name
      : article.author;
  const categoryName =
    typeof article.category === "object"
      ? article.category?.name
      : article.category;

  return (
    <article className="group">
      <Link to={articlePath(article)}>
        <img
          src={getImageUrl(article.featuredImage)}
          alt={article.title}
          className="w-full aspect-[16/10] object-cover bg-slate-100"
        />
      </Link>

      <div className="pt-3">
        {categoryName ? (
          <span className="text-xs font-bold uppercase tracking-wide text-accent">
            {categoryName}
          </span>
        ) : null}

        <Link to={articlePath(article)}>
          <h2 className="font-display text-base sm:text-lg font-bold mt-1 leading-snug group-hover:text-accent transition line-clamp-2">
            {article.title}
          </h2>
        </Link>

        <StoryExtras
          article={article}
          showTags={false}
          showSubhead={false}
          className="mt-2"
        />

        {authorName ? (
          <p className="mt-2 text-xs text-ink-muted">By {authorName}</p>
        ) : null}
      </div>
    </article>
  );
}

export default ArticleCard;
