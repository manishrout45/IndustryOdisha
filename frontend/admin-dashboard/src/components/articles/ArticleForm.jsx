import React, { useEffect, useState } from "react";
import ArticleEditor from "./ArticleEditor";
import { getCategories } from "../../services/categoryService";
import { flattenCategories } from "../../utils/categories";
import { getTags } from "../../services/tagService";

function FieldLabel({ children, hint }) {
  return (
    <label className="block mb-1.5 text-sm font-semibold text-slate-700">
      {children}
      {hint ? (
        <span className="ml-2 font-normal text-slate-400">{hint}</span>
      ) : null}
    </label>
  );
}

function ArticleForm({
  onSubmit,
  initialData = {},
  submitText = "Save Article",
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [featured, setFeatured] = useState(false);
  const [breaking, setBreaking] = useState(false);
  const [trending, setTrending] = useState(false);
  const [dontMiss, setDontMiss] = useState(false);
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState("draft");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [showSeo, setShowSeo] = useState(false);
  const [seo, setSeo] = useState({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    noIndex: false,
  });
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  useEffect(() => {
    if (!initialData || hydrated) return;
    if (!initialData._id && !initialData.title) return;

    setTitle(initialData.title || "");
    setExcerpt(initialData.excerpt || initialData.summary || "");
    setContent(initialData.content || "");
    setFeatured(Boolean(initialData.isFeatured));
    setBreaking(Boolean(initialData.isBreaking));
    setTrending(Boolean(initialData.isTrending));
    setDontMiss(Boolean(initialData.isDontMiss));
    setStatus(initialData.status || "draft");

    if (initialData.category) {
      setCategory(
        typeof initialData.category === "object"
          ? initialData.category._id
          : initialData.category
      );
    }

    if (Array.isArray(initialData.tags)) {
      setSelectedTags(
        initialData.tags.map((t) =>
          typeof t === "object" ? t._id : t
        )
      );
    }

    if (initialData.seo) {
      setSeo({
        metaTitle: initialData.seo.metaTitle || "",
        metaDescription: initialData.seo.metaDescription || "",
        metaKeywords: Array.isArray(initialData.seo.metaKeywords)
          ? initialData.seo.metaKeywords.join(", ")
          : initialData.seo.metaKeywords || "",
        canonicalUrl: initialData.seo.canonicalUrl || "",
        noIndex: Boolean(initialData.seo.noIndex),
      });
      if (
        initialData.seo.metaTitle ||
        initialData.seo.metaDescription
      ) {
        setShowSeo(true);
      }
    }

    if (initialData.featuredImage) {
      const imageUrl = initialData.featuredImage.startsWith("http")
        ? initialData.featuredImage
        : `http://localhost:5000${
            initialData.featuredImage.startsWith("/")
              ? initialData.featuredImage
              : `/${initialData.featuredImage}`
          }`;
      setPreviewImage(imageUrl);
    }

    setHydrated(true);
  }, [initialData, hydrated]);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      const categoryList =
        res?.categories || res?.data?.categories || res?.data || [];
      const tree = Array.isArray(categoryList) ? categoryList : [];
      setCategories(flattenCategories(tree));
    } catch (error) {
      console.error("Category Fetch Error:", error);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await getTags();
      const tagList = res?.tags || res?.data?.tags || res?.data || [];
      setTags(Array.isArray(tagList) ? tagList : []);
    } catch (error) {
      console.error("Tag Fetch Error:", error);
    }
  };

  const toggleTag = (id) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Title is required");
      return;
    }
    if (!category) {
      alert("Please select a category");
      return;
    }
    if (!content.trim() || content === "<p></p>") {
      alert("Content is required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("category", category);
    formData.append("excerpt", excerpt.trim());
    formData.append("status", status);
    formData.append("isFeatured", String(featured));
    formData.append("isBreaking", String(breaking));
    formData.append("isTrending", String(trending));
    formData.append("isDontMiss", String(dontMiss));
    formData.append("content", content);
    formData.append("tags", JSON.stringify(selectedTags));
    formData.append(
      "seo",
      JSON.stringify({
        metaTitle: seo.metaTitle.trim() || undefined,
        metaDescription: seo.metaDescription.trim() || undefined,
        metaKeywords: seo.metaKeywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        canonicalUrl: seo.canonicalUrl.trim() || undefined,
        noIndex: seo.noIndex,
      })
    );

    if (featuredImage) {
      formData.append("featuredImage", featuredImage);
    }

    try {
      setSaving(true);
      await onSubmit(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid xl:grid-cols-12 gap-6">
        {/* Main column */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 md:p-6 space-y-5">
            <div>
              <FieldLabel>Headline</FieldLabel>
              <input
                type="text"
                placeholder="Write a clear, compelling headline"
                className="w-full border border-slate-200 rounded-lg p-3.5 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <FieldLabel hint="Max 300 characters">
                Excerpt / Summary
              </FieldLabel>
              <textarea
                rows={3}
                maxLength={300}
                className="w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short summary shown on homepage cards and social shares"
              />
              <p className="text-xs text-slate-400 mt-1 text-right">
                {excerpt.length}/300
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <FieldLabel>Article body</FieldLabel>
              <span className="text-xs text-slate-400">
                Use the toolbar to format text, add media & embeds
              </span>
            </div>
            <ArticleEditor content={content} setContent={setContent} />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <button
              type="button"
              onClick={() => setShowSeo((v) => !v)}
              className="w-full flex items-center justify-between px-5 md:px-6 py-4 text-left"
            >
              <div>
                <p className="font-semibold text-slate-800">SEO settings</p>
                <p className="text-sm text-slate-500">
                  Meta title, description and indexing
                </p>
              </div>
              <span className="text-slate-400 text-sm">
                {showSeo ? "Hide" : "Show"}
              </span>
            </button>

            {showSeo ? (
              <div className="px-5 md:px-6 pb-6 space-y-4 border-t border-slate-100 pt-4">
                <div>
                  <FieldLabel hint="≤ 70 chars">Meta title</FieldLabel>
                  <input
                    className="w-full border border-slate-200 rounded-lg p-3"
                    value={seo.metaTitle}
                    maxLength={70}
                    onChange={(e) =>
                      setSeo((s) => ({ ...s, metaTitle: e.target.value }))
                    }
                    placeholder="Defaults to article title if empty"
                  />
                </div>
                <div>
                  <FieldLabel hint="≤ 160 chars">Meta description</FieldLabel>
                  <textarea
                    rows={3}
                    maxLength={160}
                    className="w-full border border-slate-200 rounded-lg p-3"
                    value={seo.metaDescription}
                    onChange={(e) =>
                      setSeo((s) => ({
                        ...s,
                        metaDescription: e.target.value,
                      }))
                    }
                    placeholder="Search engine snippet"
                  />
                </div>
                <div>
                  <FieldLabel hint="comma separated">Keywords</FieldLabel>
                  <input
                    className="w-full border border-slate-200 rounded-lg p-3"
                    value={seo.metaKeywords}
                    onChange={(e) =>
                      setSeo((s) => ({ ...s, metaKeywords: e.target.value }))
                    }
                    placeholder="odisha, politics, business"
                  />
                </div>
                <div>
                  <FieldLabel>Canonical URL</FieldLabel>
                  <input
                    className="w-full border border-slate-200 rounded-lg p-3"
                    value={seo.canonicalUrl}
                    onChange={(e) =>
                      setSeo((s) => ({ ...s, canonicalUrl: e.target.value }))
                    }
                    placeholder="https://"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={seo.noIndex}
                    onChange={(e) =>
                      setSeo((s) => ({ ...s, noIndex: e.target.checked }))
                    }
                  />
                  No-index this article (hide from search engines)
                </label>
              </div>
            ) : null}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="xl:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 xl:sticky xl:top-6">
            <div>
              <FieldLabel>Publish status</FieldLabel>
              <select
                className="w-full border border-slate-200 rounded-lg p-3 bg-white"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending review</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <FieldLabel>Category</FieldLabel>
              <select
                className="w-full border border-slate-200 rounded-lg p-3 bg-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.label || cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel>Tags</FieldLabel>
              {tags.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No tags yet. Create tags from the Tags page.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                  {tags.map((tag) => {
                    const active = selectedTags.includes(tag._id);
                    return (
                      <button
                        key={tag._id}
                        type="button"
                        onClick={() => toggleTag(tag._id)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition ${
                          active
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <p className="text-sm font-semibold text-slate-700">
                Homepage placement
              </p>
              <p className="text-xs text-slate-500 -mt-1">
                Select any combination of sections. An article can appear in
                multiple homepage rails at once.
              </p>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <span>
                  <span className="font-medium text-slate-800">
                    Featured (sticky)
                  </span>
                  <span className="block text-xs text-slate-500">
                    Optional WordPress sticky flag
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={trending}
                  onChange={(e) => setTrending(e.target.checked)}
                />
                <span>
                  <span className="font-medium text-slate-800">Trending</span>
                  <span className="block text-xs text-slate-500">
                    Shows in the Trending rail
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={dontMiss}
                  onChange={(e) => setDontMiss(e.target.checked)}
                />
                <span>
                  <span className="font-medium text-slate-800">Don't Miss</span>
                  <span className="block text-xs text-slate-500">
                    Shows in Don't Miss picks
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={breaking}
                  onChange={(e) => setBreaking(e.target.checked)}
                />
                <span>
                  <span className="font-medium text-slate-800">
                    Breaking news
                  </span>
                  <span className="block text-xs text-slate-500">
                    Shows in the red breaking ticker
                  </span>
                </span>
              </label>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <FieldLabel>Featured image</FieldLabel>
              <input
                type="file"
                accept="image/*"
                className="w-full text-sm border border-slate-200 rounded-lg p-2.5"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setFeaturedImage(file);
                    setPreviewImage(URL.createObjectURL(file));
                  }
                }}
              />
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="mt-3 w-full h-44 object-cover rounded-lg border border-slate-200"
                />
              ) : (
                <div className="mt-3 h-32 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-sm text-slate-400">
                  Image preview
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              {saving ? "Saving…" : submitText}
            </button>
          </div>
        </aside>
      </div>
    </form>
  );
}

export default ArticleForm;
