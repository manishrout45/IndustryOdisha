import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { HomepageFeedProvider } from "../context/HomepageFeedContext";

import BreakingNews from "../components/homepage/BreakingNews";
import HeroSection from "../components/homepage/HeroSection";
import LatestNews from "../components/homepage/LatestNews";
import TrendingNews from "../components/homepage/TrendingNews";
import MostRead from "../components/homepage/TopNews";
import CategorySections from "../components/homepage/CategoryBlock";
import OpinionSection from "../components/homepage/OpinionSection";
import VideoSection from "../components/homepage/VideoSection";
import MediaGallery from "../components/homepage/MediaGallery";
import AdSlot from "../components/ads/AdSlot";
import { getHomepage } from "../api/articleApi";

function asSections(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.sections)) return payload.sections;
  return [];
}

const DEFAULT_ORDER = [
  { type: "breaking-news", title: "Breaking News", config: { limit: 8 } },
  { type: "hero", title: "Top News", config: { limit: 6, showTitle: true } },
  { type: "latest", title: "Latest News", config: { limit: 8, showTitle: true } },
  { type: "dont-miss", title: "Don't Miss", config: { limit: 4, showTitle: true } },
  { type: "trending", title: "Trending", config: { limit: 5, showTitle: true } },
  { type: "most-read", title: "Most Read", config: { limit: 5, showTitle: true } },
  {
    type: "category-block",
    title: "Category Sections",
    config: { limit: 4, showTitle: true },
  },
  { type: "video", title: "Videos", config: { limit: 6, showTitle: true } },
  {
    type: "media-gallery",
    title: "Media Gallery",
    config: { limit: 8, showTitle: true },
  },
];

function sectionTitle(section) {
  if (section?.config?.showTitle === false) return undefined;
  return section?.title || undefined;
}

function Home() {
  const [cmsSections, setCmsSections] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getHomepage()
      .then((res) => {
        if (cancelled) return;
        const list = asSections(res.data?.data ?? res.data)
          .filter((s) => s && s.isActive !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setCmsSections(list);
      })
      .catch(() => {
        if (!cancelled) setCmsSections([]);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sections = useMemo(() => {
    if (!loaded) return [];
    if (cmsSections.length) return cmsSections;
    return DEFAULT_ORDER.map((s, i) => ({
      ...s,
      _id: `default-${s.type}`,
      order: i,
      isActive: true,
    }));
  }, [cmsSections, loaded]);

  const renderSection = (section) => {
    const key = section._id || `${section.type}-${section.order}`;
    const title = sectionTitle(section);
    const limit = Number(section.config?.limit) || 6;

    switch (section.type) {
      case "breaking-news":
        return <BreakingNews key={key} />;
      case "hero":
        return (
          <React.Fragment key={key}>
            <HeroSection title={title || "Top News"} />
            <div className="my-6">
              <AdSlot position="homepage-after-hero" size="banner" />
              <AdSlot position="homepage" size="banner" className="mt-3" />
            </div>
          </React.Fragment>
        );
      case "latest":
        return <LatestNews key={key} title={title || "Latest News"} />;
      case "dont-miss":
        return <OpinionSection key={key} title={title || "Don't Miss"} />;
      case "trending":
        return <TrendingNews key={key} title={title || "Trending"} />;
      case "most-read":
        return <MostRead key={key} title={title || "Most Read"} />;
      case "category-block":
        return (
          <React.Fragment key={key}>
            <div className="border-t border-slate-200/80 my-4" />
            <CategorySections
              categoryId={section.config?.categoryId || null}
              limit={limit}
              title={title}
            />
          </React.Fragment>
        );
      case "custom-html":
        if (!section.config?.customHtml) return null;
        return (
          <div
            key={key}
            className="my-6 sm:my-8 prose max-w-none overflow-x-auto break-words"
            dangerouslySetInnerHTML={{
              __html: section.config.customHtml,
            }}
          />
        );
      case "video":
        return (
          <VideoSection key={key} title={title || "Videos"} limit={limit} />
        );
      case "media-gallery":
        return (
          <MediaGallery
            key={key}
            title={title || "Media Gallery"}
            limit={limit}
          />
        );
      default:
        return null;
    }
  };

  // Group consecutive main-column + sidebar types into one grid when adjacent
  const layoutBlocks = useMemo(() => {
    const mainTypes = new Set(["latest", "dont-miss"]);
    const sideTypes = new Set(["trending", "most-read"]);
    const blocks = [];
    let i = 0;
    while (i < sections.length) {
      const s = sections[i];
      if (mainTypes.has(s.type) || sideTypes.has(s.type)) {
        const group = [];
        while (
          i < sections.length &&
          (mainTypes.has(sections[i].type) || sideTypes.has(sections[i].type))
        ) {
          group.push(sections[i]);
          i += 1;
        }
        blocks.push({ kind: "feed-grid", sections: group });
      } else {
        blocks.push({ kind: "single", section: s });
        i += 1;
      }
    }
    return blocks;
  }, [sections]);

  return (
    <MainLayout>
      {sections.some((s) => s.type === "breaking-news") ? (
        <BreakingNews />
      ) : null}

      <HomepageFeedProvider sections={sections}>
        <div className="max-w-site mx-auto px-4">
          {!loaded ? (
            <div className="py-16 text-center text-ink-muted text-sm">
              Loading homepage…
            </div>
          ) : (
            layoutBlocks.map((block, idx) => {
              if (block.kind === "single") {
                if (block.section.type === "breaking-news") return null;
                return (
                  <React.Fragment key={block.section._id || idx}>
                    {renderSection(block.section)}
                  </React.Fragment>
                );
              }

              const mains = block.sections.filter((s) =>
                ["latest", "dont-miss"].includes(s.type)
              );
              const sides = block.sections.filter((s) =>
                ["trending", "most-read"].includes(s.type)
              );

              if (!mains.length && !sides.length) return null;

              return (
                <div
                  key={`grid-${idx}`}
                  className="grid md:grid-cols-12 gap-6 md:gap-7 lg:gap-8 mt-6 sm:mt-8"
                >
                  {mains.length ? (
                    <div className="md:col-span-7 lg:col-span-8 space-y-2 min-w-0">
                      {mains.map((s) => renderSection(s))}
                      <div className="py-3 sm:py-4">
                        <AdSlot position="homepage-mid" size="banner" />
                      </div>
                    </div>
                  ) : (
                    <div className="md:col-span-7 lg:col-span-8" />
                  )}
                  <aside className="md:col-span-5 lg:col-span-4 min-w-0">
                    <div className="md:sticky md:top-36 space-y-5 sm:space-y-6">
                      {sides.map((s) => renderSection(s))}
                      <AdSlot position="sidebar" size="rectangle" />
                    </div>
                  </aside>
                </div>
              );
            })
          )}

          <div className="my-8">
            <AdSlot position="homepage-bottom" size="banner" />
          </div>
        </div>
      </HomepageFeedProvider>
    </MainLayout>
  );
}

export default Home;
