import React from "react";
import { Link } from "react-router-dom";
import { useHomepageFeed } from "../../context/HomepageFeedContext";
import SectionHeading from "../common/SectionHeading";
import { articlePath, getImageUrl } from "../../utils/media";

function TopNews({ title = "Most Read" }) {
  const { loading, mostRead } = useHomepageFeed();

  return (
    <section className="mb-8 news-rail p-4 sm:p-5">
      <SectionHeading title={title} subtitle="Sorted by real reader views" />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : !mostRead.length ? (
        <p className="text-sm text-ink-muted text-center py-4">
          Views will appear here as readers open stories.
        </p>
      ) : (
        <div className="space-y-5">
          {mostRead.map((news, index) => (
            <article key={news._id} className="flex gap-3 group">
              <span className="text-xl font-bold text-slate-300 w-6 shrink-0 pt-0.5">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Link to={articlePath(news)} className="shrink-0">
                <img
                  src={getImageUrl(
                    news.featuredImage,
                    "https://placehold.co/120x90?text=News"
                  )}
                  alt=""
                  className="w-16 h-16 object-cover bg-slate-100"
                />
              </Link>
              <div className="min-w-0 flex flex-col">
                <span className="text-[10px] font-bold uppercase text-[#0a4caf]">
                  {news.category?.name || "News"}
                </span>
                <Link to={articlePath(news)}>
                  <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-[#0a4caf]">
                    {news.title}
                  </h3>
                </Link>
                <p className="mt-1 text-[11px] text-ink-muted tabular-nums">
                  {Number(news.viewCount || 0).toLocaleString()} views
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default TopNews;
