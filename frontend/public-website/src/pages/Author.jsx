import React from "react";
import MainLayout from "../layouts/MainLayout";
import ArticleCard from "../components/article/ArticleCard";

function Author() {
  const articles = [];

  return (
    <MainLayout>
      <div className="max-w-site mx-auto px-4 py-8 md:py-12">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-ink mb-6 sm:mb-8">
          Author Profile
        </h1>

        <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-10">
          <img
            src="https://placehold.co/100"
            alt=""
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover bg-slate-100"
          />

          <div className="min-w-0">
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-ink">
              John Doe
            </h2>
            <p className="text-sm text-ink-muted">Senior Journalist</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

export default Author;
