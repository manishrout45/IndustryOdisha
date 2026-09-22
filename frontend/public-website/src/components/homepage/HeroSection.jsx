import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHomepageFeed } from "../../context/HomepageFeedContext";
import StoryExtras from "../common/StoryExtras";
import { articlePath, getImageUrl } from "../../utils/media";

function HeroSection({ title = "Top News" }) {
  const navigate = useNavigate();
  const { loading, topNews } = useHomepageFeed();
  const featured = topNews[0] || null;
  const sideNews = topNews.slice(1, 6);

  if (loading) {
    return (
      <section className="py-6 sm:py-10">
        <div className="h-[220px] sm:h-[320px] lg:h-[420px] bg-slate-200/70 animate-pulse" />
      </section>
    );
  }

  if (!featured) {
    return (
      <section className="pt-4 sm:pt-6 pb-2">
        <div className="flex items-center gap-3 mb-4">
          <span className="section-accent" />
          <h2 className="font-display text-xl md:text-2xl font-bold text-ink">
            {title}
          </h2>
        </div>
        <div className="news-rail p-6 sm:p-8 text-center text-ink-muted text-sm">
          No recent stories available yet. Publish an article from Admin or
          Author — newest posts appear here automatically.
        </div>
      </section>
    );
  }

  return (
    <section className="pt-4 sm:pt-6 pb-2">
      <div className="flex items-center gap-3 mb-4 sm:mb-5">
        <span className="section-accent" />
        <h2 className="font-display text-xl md:text-2xl font-bold text-ink">
          {title}
        </h2>
      </div>

      <div className="grid md:grid-cols-12 gap-5 md:gap-6 lg:gap-8">
        <article
          className="md:col-span-7 group cursor-pointer"
          onClick={() => navigate(articlePath(featured))}
        >
          {/* Full image in the left column — no crop */}
          <div className="w-full overflow-hidden bg-slate-100">
            <img
              src={getImageUrl(featured.featuredImage)}
              alt={featured.title}
              className="block w-full h-auto group-hover:opacity-95 transition duration-500"
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/1200x700?text=Top+Story";
              }}
            />
          </div>

          <div className="pt-4 sm:pt-5">
            {featured.category?.name ? (
              <span className="inline-block bg-[#0a4caf] text-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">
                {featured.category.name}
              </span>
            ) : null}
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mt-2 sm:mt-3 leading-tight text-ink group-hover:text-[#0a4caf] transition">
              {featured.title}
            </h1>
            <StoryExtras
              article={featured}
              relativeDate
              showTags
              showSubhead
              showReadMore
              className="mt-2 sm:mt-3"
              subheadClassName="max-w-2xl text-sm sm:text-base"
            />
          </div>
        </article>

        <div className="md:col-span-5 news-rail divide-y divide-slate-100">
          {sideNews.map((news) => (
            <article
              key={news._id}
              className="flex gap-3 p-3 sm:p-3.5 hover:bg-slate-50 transition"
            >
              <Link to={articlePath(news)} className="shrink-0">
                <img
                  src={getImageUrl(
                    news.featuredImage,
                    "https://placehold.co/200x140?text=News"
                  )}
                  alt=""
                  className="w-20 h-16 sm:w-24 sm:h-20 md:w-28 md:h-24 object-cover bg-slate-100"
                />
              </Link>
              <div className="min-w-0 flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#0a4caf]">
                  {news.category?.name || "News"}
                </span>
                <Link to={articlePath(news)}>
                  <h3 className="font-display font-semibold text-sm sm:text-[15px] leading-snug mt-1 line-clamp-2 text-ink hover:text-accent">
                    {news.title}
                  </h3>
                </Link>
                <StoryExtras
                  article={news}
                  relativeDate
                  showTags={false}
                  showSubhead={false}
                  className="mt-1"
                  subheadClassName="text-xs"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
