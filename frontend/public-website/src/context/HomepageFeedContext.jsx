import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axiosInstance from "../services/axiosInstance";

const HomepageFeedContext = createContext(null);

const asList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.articles)) return payload.articles;
  if (Array.isArray(payload?.data?.articles)) return payload.data.articles;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const takeUnique = (items, used, limit) => {
  const result = [];
  for (const item of items || []) {
    const id = String(item?._id || item?.id || "");
    if (!id || used.has(id)) continue;
    used.add(id);
    result.push(item);
    if (result.length >= limit) break;
  }
  return result;
};

const idsOf = (items) =>
  (items || [])
    .map((item) => String(item?._id || item?.id || ""))
    .filter(Boolean);

const limitOf = (sections, type, fallback) => {
  const section = (sections || []).find((s) => s.type === type);
  const n = Number(section?.config?.limit);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export function HomepageFeedProvider({ children, sections = [] }) {
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState({
    topNews: [],
    latestNews: [],
    trendingNews: [],
    dontMiss: [],
    mostRead: [],
  });

  const limitsKey = useMemo(
    () =>
      (sections || [])
        .map((s) => `${s.type}:${s.config?.limit ?? ""}`)
        .join("|"),
    [sections]
  );

  useEffect(() => {
    let cancelled = false;

    const heroLimit = limitOf(sections, "hero", 6);
    const trendingLimit = limitOf(sections, "trending", 5);
    const dontMissLimit = limitOf(sections, "dont-miss", 4);
    const latestLimit = limitOf(sections, "latest", 8);
    const mostReadLimit = limitOf(sections, "most-read", 5);

    const load = async () => {
      try {
        setLoading(true);
        const [featuredRes, trendingRes, dontMissRes, latestRes, mostReadRes] =
          await Promise.all([
            axiosInstance.get(`/featured-news?limit=${Math.max(heroLimit, 8)}`),
            axiosInstance.get(`/trending-news?limit=${trendingLimit}`),
            axiosInstance.get(`/dont-miss?limit=${Math.max(dontMissLimit, 8)}`),
            axiosInstance.get(`/latest-news?limit=${Math.max(latestLimit, 24)}`),
            axiosInstance.get(`/most-read?limit=${mostReadLimit}`),
          ]);

        const featured = asList(featuredRes.data?.data ?? featuredRes.data);
        const trending = asList(trendingRes.data?.data ?? trendingRes.data);
        const dontMissRaw = asList(dontMissRes.data?.data ?? dontMissRes.data);
        const latestRaw = asList(latestRes.data?.data ?? latestRes.data);
        const mostReadRaw = asList(mostReadRes.data?.data ?? mostReadRes.data);

        const topNews = takeUnique(featured, new Set(), heroLimit);
        const trendingNews = takeUnique(trending, new Set(), trendingLimit);
        const dontMiss = takeUnique(dontMissRaw, new Set(), dontMissLimit);

        let latestNews = takeUnique(
          latestRaw,
          new Set(idsOf(topNews)),
          latestLimit
        );
        if (!latestNews.length) {
          latestNews = takeUnique(latestRaw, new Set(), latestLimit);
        }

        const mostRead = takeUnique(mostReadRaw, new Set(), mostReadLimit);

        if (!cancelled) {
          setFeed({
            topNews,
            latestNews,
            trendingNews,
            dontMiss,
            mostRead,
          });
        }
      } catch (err) {
        console.error("Homepage feed error:", err);
        if (!cancelled) {
          setFeed({
            topNews: [],
            latestNews: [],
            trendingNews: [],
            dontMiss: [],
            mostRead: [],
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limitsKey]);

  const value = useMemo(
    () => ({ loading, sections, ...feed }),
    [loading, sections, feed]
  );

  return (
    <HomepageFeedContext.Provider value={value}>
      {children}
    </HomepageFeedContext.Provider>
  );
}

export function useHomepageFeed() {
  const ctx = useContext(HomepageFeedContext);
  if (!ctx) {
    throw new Error("useHomepageFeed must be used within HomepageFeedProvider");
  }
  return ctx;
}
