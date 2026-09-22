import React from "react";
import { Link } from "react-router-dom";
import { useHomepageFeed } from "../../context/HomepageFeedContext";
import SectionHeading from "../common/SectionHeading";
import StoryExtras from "../common/StoryExtras";
import { articlePath, getImageUrl } from "../../utils/media";

function OpinionSection({ title = "Don't Miss" }) {
  const { loading, dontMiss } = useHomepageFeed();

  if (loading) return null;
  if (!dontMiss.length) {
    return (
      <section className="mb-10">
        <SectionHeading title={title} subtitle="Editors' picks" />
        <div className="news-rail p-6 text-sm text-ink-muted text-center">
          No Don’t Miss stories yet. Check <strong>Don’t Miss</strong> when
          publishing an article.
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <SectionHeading title={title} subtitle="Editors' picks & analysis" />

      <div className="grid md:grid-cols-2 gap-4 sm:gap-5">
        {dontMiss.map((item) => (
          <article
            key={item._id}
            className="news-rail p-3 sm:p-4 flex gap-3 sm:gap-4 group hover:border-[#0a4caf]/30 transition"
          >
            <Link to={articlePath(item)} className="shrink-0">
              <img
                src={getImageUrl(
                  item.featuredImage,
                  "https://placehold.co/160x120?text=Story"
                )}
                alt=""
                className="w-20 h-24 sm:w-24 sm:h-28 object-cover bg-slate-100"
              />
            </Link>
            <div className="min-w-0 flex flex-col">
              <span className="text-[11px] font-bold uppercase text-[#0a4caf]">
                {item.category?.name || "Feature"}
              </span>
              <Link to={articlePath(item)}>
                <h3 className="font-display font-semibold text-sm sm:text-base leading-snug mt-1 line-clamp-2 group-hover:text-[#0a4caf]">
                  {item.title}
                </h3>
              </Link>
              <StoryExtras
                article={item}
                relativeDate
                showTags={false}
                showSubhead={false}
                className="mt-1.5"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default OpinionSection;
