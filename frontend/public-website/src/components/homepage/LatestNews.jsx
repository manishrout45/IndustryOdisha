import React from "react";
import { Link } from "react-router-dom";
import { useHomepageFeed } from "../../context/HomepageFeedContext";
import SectionHeading from "../common/SectionHeading";
import StoryExtras from "../common/StoryExtras";
import { articlePath, getImageUrl } from "../../utils/media";

function LatestNews({ title = "Latest News" }) {
  const { loading, latestNews } = useHomepageFeed();

  return (
    <section className="mb-10">
      <SectionHeading title={title} subtitle="Fresh stories from the desk" />

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 sm:h-36 bg-slate-200/70 animate-pulse" />
          ))}
        </div>
      ) : !latestNews.length ? (
        <div className="news-rail p-6 text-sm text-ink-muted text-center">
          No latest stories yet. Publish articles to fill this section.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-x-5 md:gap-x-6 gap-y-5 sm:gap-y-7">
          {latestNews.map((item) => (
            <article key={item._id} className="flex gap-3 sm:gap-4 group">
              <Link to={articlePath(item)} className="shrink-0">
                <img
                  src={getImageUrl(
                    item.featuredImage || item.image,
                    "https://placehold.co/240x160?text=Latest"
                  )}
                  alt=""
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 object-cover bg-slate-100"
                />
              </Link>
              <div className="min-w-0 py-0.5 flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#0a4caf]">
                  {item.category?.name || "News"}
                </span>
                <Link to={articlePath(item)}>
                  <h3 className="font-display font-semibold text-[15px] sm:text-[17px] leading-snug mt-1 line-clamp-2 group-hover:text-[#0a4caf] transition">
                    {item.title}
                  </h3>
                </Link>
                <StoryExtras
                  article={item}
                  showTags={false}
                  showSubhead={false}
                  className="mt-1.5"
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default LatestNews;
