import React from "react";
import ArticleCard from "./ArticleCard";

function RelatedArticles({ articles }) {
  if (!articles?.length) return null;

  return (
    <section className="mb-12 md:mb-14">
      <div className="flex items-center gap-3 mb-6">
        <span className="section-accent" />
        <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
          Related stories
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-7">
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>
    </section>
  );
}

export default RelatedArticles;
