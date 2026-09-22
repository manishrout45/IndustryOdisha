import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import SectionHeading from "../common/SectionHeading";
import StoryExtras from "../common/StoryExtras";
import {
  articlePath,
  getImageUrl,
} from "../../utils/media";

function CategoryBlock({ category, limit = 4 }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category?._id) return;
    setLoading(true);
    axiosInstance
      .get(`/articles?category=${category._id}&limit=${limit}`)
      .then((res) => {
        const list =
          res.data?.data?.articles ||
          res.data?.articles ||
          res.data?.data ||
          [];
        setArticles(Array.isArray(list) ? list : []);
      })
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [category?._id, limit]);

  if (!category) return null;
  if (!loading && !articles.length) return null;

  const lead = articles[0];
  const rest = articles.slice(1);

  return (
    <section className="mb-10">
      <SectionHeading
        title={category.name}
        to={`/category/${category.slug}`}
        linkLabel="More"
      />

      {loading ? (
        <div className="h-48 bg-slate-200/60 animate-pulse" />
      ) : (
        <div className="grid md:grid-cols-12 gap-5 md:gap-6">
          {lead ? (
            <article className="md:col-span-5 group">
              <Link to={articlePath(lead)}>
                <img
                  src={getImageUrl(lead.featuredImage)}
                  alt=""
                  className="w-full aspect-[16/10] object-cover bg-slate-100"
                />
              </Link>
              <Link to={articlePath(lead)}>
                <h3 className="font-display text-lg sm:text-xl font-bold mt-3 leading-snug group-hover:text-[#0a4caf] transition line-clamp-3">
                  {lead.title}
                </h3>
              </Link>
              <StoryExtras
                article={lead}
                showTags={false}
                showSubhead={false}
                className="mt-2"
              />
            </article>
          ) : null}

          <div className="md:col-span-7 divide-y divide-slate-100 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-6">
            {rest.map((item) => (
              <article
                key={item._id}
                className="flex gap-3 py-3 sm:py-3.5 first:pt-0 group"
              >
                <Link to={articlePath(item)} className="shrink-0">
                  <img
                    src={getImageUrl(
                      item.featuredImage,
                      "https://placehold.co/160x110?text=News"
                    )}
                    alt=""
                    className="w-20 h-[72px] sm:w-24 sm:h-[88px] object-cover bg-slate-100"
                  />
                </Link>
                <div className="min-w-0 flex flex-col">
                  <Link to={articlePath(item)}>
                    <h4 className="font-semibold text-sm sm:text-[15px] leading-snug line-clamp-2 group-hover:text-[#0a4caf]">
                      {item.title}
                    </h4>
                  </Link>
                  <StoryExtras
                    article={item}
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
      )}
    </section>
  );
}

function CategorySections({ categoryId = null, limit = 4, title = null }) {
  const [categories, setCategories] = useState([]);
  const [singleCategory, setSingleCategory] = useState(null);

  useEffect(() => {
    if (categoryId) {
      axiosInstance
        .get("/categories")
        .then((res) => {
          const list =
            res.data?.data?.categories ||
            res.data?.categories ||
            res.data?.data ||
            [];
          const flat = [];
          const walk = (nodes = []) => {
            (Array.isArray(nodes) ? nodes : []).forEach((n) => {
              flat.push(n);
              if (n.children?.length) walk(n.children);
            });
          };
          walk(list);
          const match = flat.find(
            (c) =>
              String(c._id) === String(categoryId) ||
              String(c._id).replace(/^wp-/i, "") ===
                String(categoryId).replace(/^wp-/i, "")
          );
          setSingleCategory(match || null);
          setCategories([]);
        })
        .catch(() => {
          setSingleCategory(null);
          setCategories([]);
        });
      return;
    }

    axiosInstance
      .get("/categories")
      .then((res) => {
        const list =
          res.data?.data?.categories ||
          res.data?.categories ||
          res.data?.data ||
          [];
        const roots = (Array.isArray(list) ? list : []).filter(
          (c) => !c.parent
        );
        setCategories(roots.slice(0, 4));
        setSingleCategory(null);
      })
      .catch(() => setCategories([]));
  }, [categoryId]);

  if (categoryId) {
    if (!singleCategory) return null;
    return (
      <div className="space-y-2">
        {title ? (
          <h2 className="font-display text-xl font-bold text-ink mb-2">
            {title}
          </h2>
        ) : null}
        <CategoryBlock category={singleCategory} limit={limit} />
      </div>
    );
  }

  if (!categories.length) return null;

  return (
    <div className="space-y-2">
      {title ? (
        <h2 className="font-display text-xl font-bold text-ink mb-2">{title}</h2>
      ) : null}
      {categories.map((cat) => (
        <CategoryBlock key={cat._id} category={cat} limit={limit} />
      ))}
    </div>
  );
}

export default CategorySections;
export { CategoryBlock };
