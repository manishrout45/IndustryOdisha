import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ArticleDetails from "../components/article/ArticleDetails";
import RelatedArticles from "../components/article/RelatedArticles";
import AdSlot from "../components/ads/AdSlot";
import ArticleCard from "../components/article/ArticleCard";
import { getArticle, getArticles } from "../api/articleApi";
import { getTrendingNews } from "../services/publicApi";
import { articlePath, formatNewsDate, getImageUrl } from "../utils/media";
import axiosInstance from "../services/axiosInstance";

function asList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.articles)) return payload.articles;
  if (Array.isArray(payload?.data?.articles)) return payload.data.articles;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function excludeId(list, id, limit) {
  return (list || [])
    .filter((a) => a && a._id !== id)
    .slice(0, limit);
}

function SidebarStoryList({ title, articles, numbered = false }) {
  if (!articles?.length) return null;

  return (
    <section className="news-rail p-4 sm:p-5">
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
        <span className="section-accent" />
        <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      </div>
      <ul className="space-y-4">
        {articles.map((item, index) => (
          <li key={item._id || index}>
            <article className="flex gap-3 group">
              {numbered ? (
                <span className="font-display text-2xl font-bold text-accent/70 w-7 shrink-0 leading-none pt-0.5">
                  {index + 1}
                </span>
              ) : (
                <Link to={articlePath(item)} className="shrink-0">
                  <img
                    src={getImageUrl(
                      item.featuredImage || item.image,
                      "https://placehold.co/120x90?text=News"
                    )}
                    alt=""
                    className="w-[72px] h-[72px] object-cover bg-slate-100"
                  />
                </Link>
              )}
              <div className="min-w-0 flex flex-col">
                {item.category?.name ? (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-accent">
                    {item.category.name}
                  </span>
                ) : null}
                <Link to={articlePath(item)}>
                  <h3 className="font-semibold text-[14px] leading-snug line-clamp-3 group-hover:text-accent transition">
                    {item.title}
                  </h3>
                </Link>
                {(item.publishedAt || item.createdAt) && (
                  <time className="mt-1 text-[11px] text-ink-muted">
                    {formatNewsDate(item.publishedAt || item.createdAt)}
                  </time>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StoryGridSection({ title, subtitle, articles, linkTo, linkLabel }) {
  if (!articles?.length) return null;

  return (
    <section className="mb-12 md:mb-14">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-4 mb-5 sm:mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <span className="section-accent" />
          <div className="min-w-0">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
              {title}
            </h2>
            {subtitle ? (
              <p className="text-sm text-ink-muted mt-0.5">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {linkTo ? (
          <Link
            to={linkTo}
            className="text-sm font-semibold text-accent hover:text-ink shrink-0 self-start sm:self-auto ml-5 sm:ml-0"
          >
            {linkLabel || "See all"} →
          </Link>
        ) : null}
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-7">
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>
    </section>
  );
}

function NewsletterBanner() {
  return (
    <section className="mb-10 sm:mb-12 md:mb-14 bg-ink text-white px-5 py-7 sm:px-6 sm:py-8 md:px-10 md:py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 sm:gap-6">
        <div className="max-w-xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55 mb-2">
            Daily briefing
          </p>
          <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold leading-tight">
            Get top Odisha stories in your inbox
          </h2>
          <p className="mt-2 text-sm text-white/65 leading-relaxed">
            Free newsletter with the day&apos;s top and trending news — no spam.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("open-subscribe"))
          }
          className="w-full md:w-auto shrink-0 inline-flex items-center justify-center px-6 py-3 bg-accent hover:bg-accent-soft text-white text-sm font-bold uppercase tracking-wide transition"
        >
          Subscribe free
        </button>
      </div>
    </section>
  );
}

function ExploreCategories({ categories, currentSlug }) {
  const list = (categories || []).filter((c) => c.slug !== currentSlug).slice(0, 8);
  if (!list.length) return null;

  return (
    <section className="mb-4">
      <div className="flex items-center gap-3 mb-5">
        <span className="section-accent" />
        <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
          Explore sections
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {list.map((cat) => (
          <Link
            key={cat._id}
            to={`/category/${cat.slug}`}
            className="px-4 py-4 bg-white border border-slate-200 hover:border-accent hover:text-accent transition text-center"
          >
            <span className="font-semibold text-sm">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Article() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [latestArticles, setLatestArticles] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [mostRead, setMostRead] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchArticle = async () => {
      setError("");
      setArticle(null);
      setRelatedArticles([]);
      setLatestArticles([]);
      setTrendingArticles([]);
      setMostRead([]);
      try {
        const viewKey = `io_viewed:${slug}`;
        let shouldTrack = true;
        try {
          if (sessionStorage.getItem(viewKey)) shouldTrack = false;
          else sessionStorage.setItem(viewKey, "1");
        } catch {
          shouldTrack = true;
        }

        const res = await getArticle(slug, { track: shouldTrack });
        const data = res.data?.data || res.data;
        if (cancelled) return;
        setArticle(data);

        const [relatedRes, latestRes, trendingRes, mostReadRes, catsRes] =
          await Promise.all([
            data?.category?._id
              ? getArticles({ category: data.category._id, limit: 12 })
              : Promise.resolve(null),
            axiosInstance.get("/latest-news?limit=12").catch(() => null),
            getTrendingNews().catch(() => null),
            axiosInstance.get("/most-read?limit=8").catch(() => null),
            axiosInstance.get("/categories").catch(() => null),
          ]);

        if (cancelled) return;

        const related = excludeId(asList(relatedRes?.data?.data ?? relatedRes?.data), data._id, 8);
        setRelatedArticles(related);

        const latest = excludeId(
          asList(latestRes?.data?.data ?? latestRes?.data),
          data._id,
          8
        );
        setLatestArticles(latest);

        const trending = excludeId(
          asList(trendingRes?.data?.data ?? trendingRes?.data),
          data._id,
          6
        );
        setTrendingArticles(trending);

        const mostReadList = excludeId(
          asList(mostReadRes?.data?.data ?? mostReadRes?.data),
          data._id,
          6
        );
        setMostRead(mostReadList);

        const cats =
          catsRes?.data?.data?.categories ||
          catsRes?.data?.categories ||
          catsRes?.data?.data ||
          [];
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Article not found.");
      }
    };

    fetchArticle();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) {
    return (
      <MainLayout>
        <div className="py-24 text-center text-ink-muted">{error}</div>
      </MainLayout>
    );
  }

  if (!article) {
    return (
      <MainLayout>
        <div className="max-w-site mx-auto px-4 py-10">
          <div className="grid md:grid-cols-12 gap-6 md:gap-8 lg:gap-10">
            <div className="md:col-span-7 lg:col-span-8 space-y-4">
              <div className="h-4 w-40 bg-slate-200/80 animate-pulse" />
              <div className="h-10 sm:h-12 bg-slate-200/80 animate-pulse" />
              <div className="h-10 sm:h-12 w-4/5 bg-slate-200/70 animate-pulse" />
              <div className="aspect-[16/9] max-h-[280px] sm:max-h-none bg-slate-200/60 animate-pulse mt-6" />
              <div className="space-y-3 pt-6">
                <div className="h-4 bg-slate-100 animate-pulse" />
                <div className="h-4 bg-slate-100 animate-pulse" />
                <div className="h-4 w-5/6 bg-slate-100 animate-pulse" />
              </div>
            </div>
            <div className="md:col-span-5 lg:col-span-4 space-y-4">
              <div className="h-48 bg-slate-100 animate-pulse" />
              <div className="h-64 bg-slate-100 animate-pulse" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const alsoRead = relatedArticles[0] || latestArticles[0] || null;
  const relatedForGrid = relatedArticles.slice(0, 4);
  const latestForGrid = latestArticles
    .filter((a) => !relatedForGrid.some((r) => r._id === a._id))
    .slice(0, 4);
  const sidebarRelated = relatedArticles.slice(0, 5);
  const sidebarLatest = latestArticles
    .filter((a) => !sidebarRelated.some((r) => r._id === a._id))
    .slice(0, 5);

  return (
    <MainLayout>
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-site mx-auto px-4 pt-5 sm:pt-6 md:pt-8 pb-8 sm:pb-10 md:pb-14">
          <div className="grid md:grid-cols-12 gap-6 md:gap-8 lg:gap-10 xl:gap-12">
            <div className="md:col-span-7 lg:col-span-8 min-w-0">
              <ArticleDetails article={article} alsoRead={alsoRead} />
            </div>

            <aside className="md:col-span-5 lg:col-span-4 min-w-0">
              <div className="md:sticky md:top-36 space-y-5 sm:space-y-6">
                <SidebarStoryList title="Related" articles={sidebarRelated} />
                <SidebarStoryList
                  title="Trending"
                  articles={trendingArticles.slice(0, 5)}
                  numbered
                />
                <AdSlot position="sidebar" size="rectangle" />
                <div className="hidden sm:block space-y-5 sm:space-y-6">
                  <SidebarStoryList title="Latest" articles={sidebarLatest} />
                  <SidebarStoryList
                    title="Most read"
                    articles={mostRead.slice(0, 5)}
                    numbered
                  />
                </div>
                <div className="news-rail p-4 sm:p-5 bg-accent-softbg/40">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent mb-2">
                    Newsletter
                  </p>
                  <p className="font-display text-lg font-bold text-ink leading-snug">
                    Stay informed every morning
                  </p>
                  <p className="mt-1.5 text-sm text-ink-muted">
                    Top headlines from Odisha, delivered free.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      window.dispatchEvent(new CustomEvent("open-subscribe"))
                    }
                    className="mt-4 w-full py-2.5 bg-accent text-white text-sm font-bold hover:bg-ink transition"
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div className="max-w-site mx-auto px-4 py-10 md:py-14">
        <AdSlot position="in-article" size="banner" className="mb-10" />

        <RelatedArticles articles={relatedForGrid} />

        <StoryGridSection
          title="Latest news"
          subtitle="Fresh stories from across Odisha"
          articles={latestForGrid}
          linkTo="/"
          linkLabel="Home"
        />

        {trendingArticles.length > 0 ? (
          <section className="mb-12 md:mb-14">
            <div className="flex items-center gap-3 mb-6">
              <span className="section-accent" />
              <h2 className="font-display text-xl sm:text-2xl font-bold text-ink">
                Trending now
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {trendingArticles.slice(0, 6).map((item, index) => (
                <Link
                  key={item._id}
                  to={articlePath(item)}
                  className="group flex gap-4 p-4 bg-white border border-slate-200 hover:border-accent/40 transition"
                >
                  <span className="font-display text-3xl font-bold text-accent/50 leading-none w-8 shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    {item.category?.name ? (
                      <span className="text-[10px] font-bold uppercase text-accent">
                        {item.category.name}
                      </span>
                    ) : null}
                    <h3 className="font-semibold text-[15px] leading-snug line-clamp-3 group-hover:text-accent">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {mostRead.length > 0 ? (
          <StoryGridSection
            title="Most read"
            subtitle="Popular with our readers"
            articles={mostRead.slice(0, 4)}
          />
        ) : null}

        <NewsletterBanner />

        <ExploreCategories
          categories={categories}
          currentSlug={article.category?.slug}
        />
      </div>
    </MainLayout>
  );
}

export default Article;
