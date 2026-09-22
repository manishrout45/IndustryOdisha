import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ArticleCard from "../components/article/ArticleCard";
import AdSlot from "../components/ads/AdSlot";
import axiosInstance from "../services/axiosInstance";

function Category() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const catRes = await axiosInstance.get(`/categories/${slug}`);
        const cat = catRes.data?.data || catRes.data;
        if (cancelled) return;
        setCategory(cat);

        if (cat?._id) {
          const artRes = await axiosInstance.get("/articles", {
            params: { category: cat._id, limit: 24 },
          });
          const list =
            artRes.data?.data?.articles ||
            artRes.data?.articles ||
            artRes.data?.data ||
            [];
          if (!cancelled) setArticles(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setCategory(null);
          setArticles([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <MainLayout>
      <div className="max-w-site mx-auto px-4 py-8 md:py-12">
        <nav className="text-sm text-ink-muted mb-4">
          <Link to="/" className="hover:text-accent">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink capitalize">
            {category?.name || slug}
          </span>
        </nav>

        <div className="flex items-center gap-3 mb-8">
          <span className="section-accent" />
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-ink capitalize">
            {category?.name || slug}
          </h1>
        </div>

        <AdSlot position="category-top" size="banner" className="mb-8" />

        {loading ? (
          <div className="py-16 text-center text-ink-muted">Loading…</div>
        ) : articles.length === 0 ? (
          <div className="py-16 text-center text-ink-muted news-rail">
            No published articles in this section yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {articles.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Category;
