import React from "react";
import { Link } from "react-router-dom";
import { useHomepageFeed } from "../../context/HomepageFeedContext";
import SectionHeading from "../common/SectionHeading";
import StoryExtras from "../common/StoryExtras";
import { articlePath } from "../../utils/media";

function TrendingNews({ title = "Trending" }) {
  const { loading, trendingNews } = useHomepageFeed();

  return (
    <section className="mb-8 news-rail p-4 sm:p-5">
      <SectionHeading title={title} subtitle="Marked as Trending by editors" />

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : trendingNews.length === 0 ? (
        <p className="text-sm text-ink-muted">
          No trending stories selected. Enable <strong>Trending</strong> on an
          article in the CMS.
        </p>
      ) : (
        <ol className="space-y-5">
          {trendingNews.map((news, index) => (
            <li key={news._id || index}>
              <article className="flex gap-3 group">
                <span className="font-display text-2xl font-bold text-[#0a4caf]/80 w-7 shrink-0 leading-none">
                  {index + 1}
                </span>
                <div className="min-w-0 flex flex-col">
                  <Link to={articlePath(news)}>
                    <h3 className="font-semibold text-[15px] leading-snug line-clamp-2 group-hover:text-[#0a4caf] transition">
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
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default TrendingNews;
