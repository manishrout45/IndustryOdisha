import React, { useEffect, useState } from "react";
import ArticleEditor from "./ArticleEditor";
import { getCategories } from "../../services/categoryService";
import { flattenCategories } from "../../utils/categories";

function ArticleForm({
  onSubmit,
  initialData = {},
  submitText = "Save Article",
  loading = false,
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    console.log("=== INITIAL DATA ===");
    console.log(initialData);

    if (
      !initialData ||
      Object.keys(initialData).length === 0
    ) {
      return;
    }

    setTitle(initialData.title || "");

    setExcerpt(
      initialData.excerpt ||
        initialData.summary ||
        ""
    );

    setContent(initialData.content || "");

    setFeatured(
      initialData.isFeatured || false
    );
    setBreaking(Boolean(initialData.isBreaking));
    setTrending(Boolean(initialData.isTrending));
    setDontMiss(Boolean(initialData.isDontMiss));

    setStatus(
      initialData.status || "draft"
    );

    const categoryValue =
      initialData.category?._id ||
      initialData.categoryId ||
      initialData.category ||
      "";

    setCategory(categoryValue);

    if (initialData.featuredImage) {
      const imageUrl =
        initialData.featuredImage.startsWith("http")
          ? initialData.featuredImage
          : `${
              import.meta.env.VITE_API_URL ||
              "http://localhost:5000"
            }${initialData.featuredImage}`;

      setPreviewImage(imageUrl);
    }
  }, [initialData]);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();

      console.log("CATEGORIES:", res);

      const categoryList =
        res?.categories ||
        res?.data?.categories ||
        res?.data ||
        [];

      setCategories(
        flattenCategories(
          Array.isArray(categoryList) ? categoryList : []
        )
      );
    } catch (error) {
      console.error(
        "Category Fetch Error:",
        error
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    if (!category) {
      alert("Please select a category");
      return;
    }

    if (!content.trim()) {
      alert("Content is required");
      return;
    }

    const formData = new FormData();

    formData.append("title", title);

    // Change to categoryId if your backend requires it
    formData.append("category", category);

    formData.append("excerpt", excerpt);
    formData.append("status", status);
    formData.append("isFeatured", String(featured));
    formData.append("isBreaking", String(breaking));
    formData.append("isTrending", String(trending));
    formData.append("isDontMiss", String(dontMiss));
    formData.append("content", content);

    if (featuredImage) {
      formData.append(
        "featuredImage",
        featuredImage
      );
    }

    console.log("=== SUBMIT DATA ===");

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="cms-card p-5 md:p-6 space-y-5"
    >
      {/* Title */}
      <div>
        <label className="cms-label">
          Article Title
        </label>

        <input
          type="text"
          placeholder="Enter article title"
          className="cms-input text-lg font-semibold"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block mb-2 font-medium">
          Category
        </label>

        <select
          className="w-full border rounded-lg p-3"
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          required
        >
          <option value="">
            Select Category
          </option>

          {categories.map((cat) => (
            <option
              key={cat._id}
              value={cat._id}
            >
              {cat.label || cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Excerpt */}
      <div>
        <label className="block mb-2 font-medium">
          Excerpt
        </label>

        <textarea
          rows={3}
          className="w-full border rounded-lg p-3"
          value={excerpt}
          onChange={(e) =>
            setExcerpt(e.target.value)
          }
          placeholder="Short summary of the article"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block mb-2 font-medium">
          Status
        </label>

        <select
          className="w-full border rounded-lg p-3"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option value="draft">
            Draft
          </option>

          <option value="pending">
            Pending Review
          </option>

          <option value="published">
            Published
          </option>
        </select>
      </div>

      {/* Homepage placement */}
      <div className="space-y-3 border border-slate-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-ink">Homepage placement</p>
        <p className="text-xs text-ink-muted">
          Select any combination — an article can appear in multiple homepage
          sections at once.
        </p>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          <span>
            <span className="font-medium">Top News / Featured</span>
            <span className="block text-xs text-ink-muted">Hero section</span>
          </span>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={trending}
            onChange={(e) => setTrending(e.target.checked)}
          />
          <span>
            <span className="font-medium">Trending</span>
            <span className="block text-xs text-ink-muted">Trending rail</span>
          </span>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={dontMiss}
            onChange={(e) => setDontMiss(e.target.checked)}
          />
          <span>
            <span className="font-medium">Don't Miss</span>
            <span className="block text-xs text-ink-muted">Editors' picks</span>
          </span>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            className="mt-1"
            checked={breaking}
            onChange={(e) => setBreaking(e.target.checked)}
          />
          <span>
            <span className="font-medium">Breaking News</span>
            <span className="block text-xs text-ink-muted">Ticker</span>
          </span>
        </label>
      </div>

      {/* Featured Image */}
      <div>
        <label className="block mb-2 font-medium">
          Featured Image
        </label>

        <input
          type="file"
          accept="image/*"
          className="w-full border rounded-lg p-3"
          onChange={(e) => {
            const file =
              e.target.files?.[0];

            if (file) {
              setFeaturedImage(file);

              setPreviewImage(
                URL.createObjectURL(file)
              );
            }
          }}
        />

        {previewImage && (
          <div className="mt-4">
            <img
              src={previewImage}
              alt="Preview"
              className="w-80 h-48 object-cover rounded-lg border shadow"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <label className="block mb-2 font-medium">
          Content
        </label>

        <ArticleEditor
          content={content}
          setContent={setContent}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="cms-btn-primary"
      >
        {loading
          ? "Saving..."
          : submitText}
      </button>
    </form>
  );
}

export default ArticleForm;