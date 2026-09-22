import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFeaturedNews } from "../../services/publicApi";

function FeaturedNews() {
  const [featuredNews, setFeaturedNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedNews();
  }, []);

  const loadFeaturedNews = async () => {
    try {
      const res = await getFeaturedNews();
      setFeaturedNews(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error(error);
      setFeaturedNews([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-5">Featured News</h2>
        <p>Loading...</p>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-bold mb-5">Featured News</h2>

      <div className="grid lg:grid-cols-3 gap-6">
        {featuredNews.map((article) => (
          <Link
            key={article._id}
            to={`/news/${article.slug}`}
            className="group"
          >
            <img
              src={
                article.featuredImage ||
                article.image ||
                "https://placehold.co/500x300"
              }
              alt={article.title}
              className="w-full h-60 object-cover rounded-lg"
            />

            <h3 className="font-semibold mt-3 group-hover:text-[#0a4caf]">
              {article.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default FeaturedNews;