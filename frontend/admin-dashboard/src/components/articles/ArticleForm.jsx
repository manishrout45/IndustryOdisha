import React, { useEffect, useRef, useState } from "react";
import { Eye, X } from "lucide-react";
import ArticleEditor from "./ArticleEditor";
import AlsoReadPicker from "./AlsoReadPicker";
import SeoPanel from "./SeoPanel";
import { getCategories } from "../../services/categoryService";
import { flattenCategories } from "../../utils/categories";
import { createTag, getTags } from "../../services/tagService";
import { getAuthors } from "../../services/authorService";
import { formatDateTime, openPublicArticle } from "../../utils/media";
import { toSlug } from "../../utils/seoAnalysis";

function autoSaveStorageKey(articleId) {
  return `io-article-autosave:${articleId || "new"}`;
}

function formatLastSavedStamp(value) {
  if (!value && value !== 0) return "";
  const stamp = formatDateTime(value);
  return stamp === "—" ? "" : stamp;
}

function readStoredAutoSaveAt(articleId) {
  try {
    const raw = window.localStorage.getItem(autoSaveStorageKey(articleId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.at || null;
  } catch {
    return null;
  }
}

function resolveLastSavedStamp(initialData = {}) {
  const id = initialData?._id || initialData?.id || "new";
  const fromArticle =
    initialData?.lastEditedAt ||
    initialData?.updatedAt ||
    initialData?.modifiedAt ||
    null;
  const fromStore = readStoredAutoSaveAt(id);
  const fromNewStore = id !== "new" ? readStoredAutoSaveAt("new") : null;
  const times = [fromArticle, fromStore, fromNewStore]
    .filter(Boolean)
    .map((v) => new Date(v).getTime())
    .filter((n) => !Number.isNaN(n));
  if (!times.length) return "";
  return formatLastSavedStamp(Math.max(...times));
}

const EMPTY_SEO = {
  focusKeyphrase: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  canonicalUrl: "",
  featuredAlt: "",
  noIndex: false,
};

function articleBodyHtml(content, excerpt) {
  const html = String(content || "").trim();
  if (html && html !== "<p></p>" && html !== "<p><br></p>") return html;
  if (excerpt) return `<p>${excerpt}</p>`;
  return "";
}

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

const AUTOSAVE_MS = 2 * 60 * 1000;

function ArticleForm({
  onSubmit,
  onAutoSave,
  initialData = {},
  submitText = "Save Article",
}) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [category, setCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [featured, setFeatured] = useState(false);
  const [breaking, setBreaking] = useState(false);
  const [trending, setTrending] = useState(false);
  const [dontMiss, setDontMiss] = useState(false);
  const [explainer, setExplainer] = useState(false);
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [status, setStatus] = useState("published");
  const [featuredImage, setFeaturedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagQuery, setTagQuery] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const [seo, setSeo] = useState(EMPTY_SEO);
  const [saving, setSaving] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [alsoReadMode, setAlsoReadMode] = useState("auto");
  const [alsoReadId, setAlsoReadId] = useState("");
  const [authors, setAuthors] = useState([]);
  const [authorId, setAuthorId] = useState("");
  const [autoSaving, setAutoSaving] = useState(false);
  const [autoSaveNote, setAutoSaveNote] = useState("");
  const viewRef = useRef(null);
  const dirtyRef = useRef(false);
  const autoSavingRef = useRef(false);
  const snapshotRef = useRef("");
  const savingRef = useRef(false);
  const stateRef = useRef({});

  useEffect(() => {
    fetchCategories();
    fetchTags();
    getAuthors()
      .then((list) => setAuthors(Array.isArray(list) ? list : []))
      .catch(() => setAuthors([]));
  }, []);

  useEffect(() => {
    if (!initialData || hydrated) return;
    if (!initialData._id && !initialData.title) return;

    setTitle(initialData.title || "");
    setSlug(initialData.slug || toSlug(initialData.title || "") || "");
    setSlugTouched(Boolean(initialData.slug));
    setExcerpt(initialData.excerpt || initialData.summary || "");
    setContent(initialData.content || "");
    setFeatured(Boolean(initialData.isFeatured));
    setBreaking(Boolean(initialData.isBreaking));
    setTrending(Boolean(initialData.isTrending));
    setDontMiss(Boolean(initialData.isDontMiss));
    setExplainer(Boolean(initialData.isExplainer));
    setStatus(
      initialData.status === "pending" || !initialData.status
        ? "published"
        : initialData.status
    );
    setAlsoReadMode(initialData.alsoReadMode || "auto");
    setAlsoReadId(
      initialData.alsoReadMode === "custom"
        ? initialData.alsoRead?._id || initialData.alsoRead || ""
        : ""
    );

    if (initialData.category) {
      setCategory(
        typeof initialData.category === "object"
          ? initialData.category._id
          : initialData.category
      );
    }

    if (initialData.author) {
      setAuthorId(
        String(
          typeof initialData.author === "object"
            ? initialData.author._id || initialData.author.id || ""
            : initialData.author
        )
      );
    }

    if (Array.isArray(initialData.tags)) {
      setSelectedTags(
        initialData.tags.map((t) =>
          String(typeof t === "object" ? t._id : t)
        )
      );
    }

    if (initialData.seo) {
      setSeo({
        focusKeyphrase: initialData.seo.focusKeyphrase || "",
        metaTitle: String(initialData.seo.metaTitle || "").slice(0, 70),
        metaDescription: String(initialData.seo.metaDescription || "").slice(
          0,
          160
        ),
        metaKeywords: Array.isArray(initialData.seo.metaKeywords)
          ? initialData.seo.metaKeywords.join(", ")
          : initialData.seo.metaKeywords || "",
        canonicalUrl: initialData.seo.canonicalUrl || "",
        featuredAlt:
          initialData.seo.featuredAlt || initialData.featuredImageAlt || "",
        noIndex: Boolean(initialData.seo.noIndex),
      });
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

    const lastSaved = resolveLastSavedStamp(initialData);
    if (lastSaved) setAutoSaveNote(lastSaved);

    setHydrated(true);
  }, [initialData, hydrated]);

  useEffect(() => {
    if (autoSaveNote) return;
    const lastSaved = resolveLastSavedStamp(initialData || {});
    if (lastSaved) setAutoSaveNote(lastSaved);
  }, [initialData?._id, initialData?.id, autoSaveNote]);

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
    const key = String(id);
    setSelectedTags((prev) =>
      prev.map(String).includes(key)
        ? prev.filter((t) => String(t) !== key)
        : [...prev, key]
    );
  };

  const articleTagObjects = Array.isArray(initialData?.tags)
    ? initialData.tags.filter((t) => t && typeof t === "object")
    : [];

  const selectedTagObjects = selectedTags
    .map(
      (id) =>
        tags.find((t) => String(t._id) === String(id)) ||
        articleTagObjects.find((t) => String(t._id) === String(id))
    )
    .filter(Boolean);

  const tagQueryTrimmed = tagQuery.trim();
  const exactTagMatch = tags.find(
    (t) =>
      String(t.name || "").toLowerCase() === tagQueryTrimmed.toLowerCase()
  );
  const canCreateTag =
    Boolean(tagQueryTrimmed) &&
    !exactTagMatch &&
    !creatingTag;

  const tagMatches = (() => {
    const q = tagQueryTrimmed.toLowerCase();
    const selected = new Set(selectedTags.map(String));
    const pool = tags.filter((t) => !selected.has(String(t._id)));
    const list = q
      ? pool.filter((t) => String(t.name || "").toLowerCase().includes(q))
      : pool;
    return list.slice(0, 60);
  })();

  const handleCreateTag = async () => {
    const name = tagQuery.trim();
    if (!name || creatingTag) return;

    const existing = tags.find(
      (t) => String(t.name || "").toLowerCase() === name.toLowerCase()
    );
    if (existing) {
      toggleTag(existing._id);
      setTagQuery("");
      return;
    }

    try {
      setCreatingTag(true);
      const res = await createTag({ name });
      const created =
        res?.data?.data || res?.data?.tag || res?.data || res?.tag || res;
      const tag =
        created && typeof created === "object" && created._id
          ? created
          : null;
      if (!tag?._id) {
        throw new Error("Tag was created but no id was returned");
      }

      setTags((prev) => {
        if (prev.some((t) => String(t._id) === String(tag._id))) return prev;
        return [...prev, tag].sort((a, b) =>
          String(a.name || "").localeCompare(String(b.name || ""))
        );
      });
      setSelectedTags((prev) =>
        prev.map(String).includes(String(tag._id))
          ? prev
          : [...prev, String(tag._id)]
      );
      setTagQuery("");
    } catch (error) {
      console.error(error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to create tag"
      );
    } finally {
      setCreatingTag(false);
    }
  };

  const buildFormDataFrom = (
    state,
    { forceDraft = false, includeImage = true } = {}
  ) => {
    const formData = new FormData();
    const safeTitle =
      String(state.title || "").trim() ||
      `Untitled draft ${new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    formData.append("title", safeTitle);
    formData.append(
      "slug",
      (String(state.slug || "").trim() || toSlug(safeTitle)).trim()
    );
    if (state.category) formData.append("category", state.category);
    formData.append("excerpt", String(state.excerpt || "").trim());
    formData.append("status", forceDraft ? "draft" : state.status);
    formData.append("isFeatured", String(Boolean(state.featured)));
    formData.append("isBreaking", String(Boolean(state.breaking)));
    formData.append("isTrending", String(Boolean(state.trending)));
    formData.append("isDontMiss", String(Boolean(state.dontMiss)));
    formData.append("isExplainer", String(Boolean(state.explainer)));
    formData.append(
      "alsoRead",
      state.alsoReadMode === "custom"
        ? state.alsoReadId || "auto"
        : state.alsoReadMode || "auto"
    );
    formData.append("content", state.content || "");
    formData.append("tags", JSON.stringify(state.selectedTags || []));
    if (state.authorId) {
      formData.append("authorId", state.authorId);
      formData.append("author", state.authorId);
    }
    const seoState = state.seo || EMPTY_SEO;
    formData.append(
      "seo",
      JSON.stringify({
        focusKeyphrase: String(seoState.focusKeyphrase || "").trim(),
        metaTitle: String(seoState.metaTitle || "").trim().slice(0, 70),
        metaDescription: String(seoState.metaDescription || "")
          .trim()
          .slice(0, 160),
        metaKeywords: String(seoState.metaKeywords || "")
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        canonicalUrl: String(seoState.canonicalUrl || "").trim(),
        featuredAlt: String(seoState.featuredAlt || "").trim(),
        noIndex: Boolean(seoState.noIndex),
      })
    );
    if (includeImage && state.featuredImage) {
      formData.append("featuredImage", state.featuredImage);
    }
    return formData;
  };

  useEffect(() => {
    savingRef.current = saving;
  }, [saving]);

  useEffect(() => {
    const next = {
      title,
      slug,
      category,
      selectedTags,
      featured,
      breaking,
      trending,
      dontMiss,
      explainer,
      content,
      excerpt,
      status,
      alsoReadMode,
      alsoReadId,
      authorId,
      seo,
      featuredImage,
      previewImage,
      articleId: initialData?._id || initialData?.id || "",
    };
    const fingerprint = JSON.stringify({
      ...next,
      featuredImage: Boolean(featuredImage),
    });
    stateRef.current = { ...next, fingerprint };
    if (!snapshotRef.current) {
      snapshotRef.current = fingerprint;
      return;
    }
    if (fingerprint !== snapshotRef.current) dirtyRef.current = true;
  }, [
    title,
    slug,
    category,
    selectedTags,
    featured,
    breaking,
    trending,
    dontMiss,
    explainer,
    content,
    excerpt,
    status,
    alsoReadMode,
    alsoReadId,
    authorId,
    seo,
    featuredImage,
    previewImage,
    initialData?._id,
    initialData?.id,
  ]);

  useEffect(() => {
    if (typeof onAutoSave !== "function") return undefined;

    const runAutoSave = async () => {
      if (autoSavingRef.current || savingRef.current) return;
      const state = stateRef.current || {};
      const body = String(state.content || "").trim();
      const hasWork =
        Boolean(String(state.title || "").trim()) ||
        Boolean(String(state.excerpt || "").trim()) ||
        (Boolean(body) && body !== "<p></p>" && body !== "<p><br></p>");
      if (!hasWork) return;
      if (!dirtyRef.current && state.articleId) return;

      autoSavingRef.current = true;
      setAutoSaving(true);
      try {
        const savedAt = Date.now();
        try {
          window.localStorage.setItem(
            autoSaveStorageKey(state.articleId),
            JSON.stringify({ at: savedAt, ...state, featuredImage: null })
          );
        } catch {
          /* ignore */
        }

        const isNew = !state.articleId;
        const formData = buildFormDataFrom(state, {
          forceDraft: isNew,
          includeImage: Boolean(state.featuredImage),
        });
        await onAutoSave(formData, { isNew });
        dirtyRef.current = false;
        snapshotRef.current = state.fingerprint;
        if (state.featuredImage) setFeaturedImage(null);
        setAutoSaveNote(formatLastSavedStamp(savedAt));
      } catch (error) {
        console.error(error);
        setAutoSaveNote(`failed · ${formatLastSavedStamp(Date.now())}`);
      } finally {
        autoSavingRef.current = false;
        setAutoSaving(false);
      }
    };

    const timer = window.setInterval(runAutoSave, AUTOSAVE_MS);
    return () => window.clearInterval(timer);
  }, [onAutoSave]);

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

    const formData = buildFormDataFrom(stateRef.current, {
      forceDraft: false,
      includeImage: true,
    });

    try {
      setSaving(true);
      await onSubmit(formData);
      dirtyRef.current = false;
      snapshotRef.current = stateRef.current?.fingerprint || "";
      const savedAt = Date.now();
      setAutoSaveNote(formatLastSavedStamp(savedAt));
      try {
        const id = initialData?._id || initialData?.id || "new";
        window.localStorage.setItem(
          autoSaveStorageKey(id),
          JSON.stringify({ at: savedAt })
        );
      } catch {
        /* ignore */
      }
    } finally {
      setSaving(false);
    }
  };

  const categoryName =
    categories.find((cat) => String(cat._id) === String(category))?.name ||
    categories.find((cat) => String(cat._id) === String(category))?.label ||
    "";
  const bodyHtml = articleBodyHtml(content, excerpt);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {viewing ? (
        <section
          ref={viewRef}
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-50">
            <p className="text-sm font-semibold text-ink">Article view</p>
            <button
              type="button"
              onClick={() => setViewing(false)}
              className="cms-btn-ghost text-xs py-1.5 inline-flex items-center gap-1.5"
            >
              <X size={14} />
              Close
            </button>
          </div>
          {previewImage ? (
            <img
              src={previewImage}
              alt={title || "Featured image"}
              className="w-full max-h-[360px] object-cover bg-slate-100"
            />
          ) : null}
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {categoryName ? (
                <span className="text-[11px] font-bold uppercase tracking-wide text-accent">
                  {categoryName}
                </span>
              ) : null}
              <span className="text-[10px] font-bold uppercase bg-ink/5 text-ink px-2 py-0.5 rounded-full">
                {status || "draft"}
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold text-ink mb-3">
              {title.trim() || "Untitled article"}
            </h1>
            {excerpt ? (
              <p className="text-base text-ink-muted mb-4 leading-relaxed">
                {excerpt}
              </p>
            ) : null}
            {bodyHtml ? (
              <div
                className="prose prose-lg max-w-none text-ink [&_img]:rounded-lg [&_img]:w-full [&_img]:h-auto"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            ) : (
              <p className="text-sm text-ink-muted">
                No article body yet. Write in the editor below, then click View
                again.
              </p>
            )}
          </div>
        </section>
      ) : null}

      <div className="grid xl:grid-cols-12 gap-6">
        {/* Main column */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 md:p-6 space-y-5">
            <div>
              <FieldLabel>Headline</FieldLabel>
              <input
                type="text"
                placeholder="Write a clear, compelling headline"
                className="w-full border border-slate-200 rounded-lg p-3.5 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                value={title}
                onChange={(e) => {
                  const next = e.target.value;
                  setTitle(next);
                  if (!slugTouched) setSlug(toSlug(next));
                }}
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

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <FieldLabel>Article body</FieldLabel>
              <span className="text-xs text-slate-400">
                Use the toolbar to format text, add media & embeds
              </span>
            </div>
            <ArticleEditor content={content} setContent={setContent} />
          </div>

          <AlsoReadPicker
            articleId={initialData?._id || initialData?.id || ""}
            categoryId={category}
            mode={alsoReadMode}
            selectedId={alsoReadId}
            initialOptions={initialData?.alsoReadOptions || []}
            initialSelected={initialData?.alsoRead || null}
            onChange={({ mode: nextMode, id }) => {
              setAlsoReadMode(nextMode);
              setAlsoReadId(id || "");
            }}
          />

          <SeoPanel
            seo={seo}
            onChange={setSeo}
            title={title}
            content={content}
            excerpt={excerpt}
            slug={slug}
            onSlugChange={(value) => {
              setSlugTouched(true);
              setSlug(value);
            }}
            categorySlug={
              categories.find((cat) => String(cat._id) === String(category))
                ?.slug || "news"
            }
            featuredImage={previewImage}
          />
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
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <FieldLabel hint="Shown on the public article page">
                Display author
              </FieldLabel>
              <select
                className="w-full border border-slate-200 rounded-lg p-3 bg-white"
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
              >
                <option value="">
                  {initialData?.author?.name
                    ? `Current: ${initialData.author.name}`
                    : "Select author"}
                </option>
                {(() => {
                  const options = [...authors];
                  const currentId = String(
                    initialData?.author?._id ||
                      initialData?.author?.id ||
                      authorId ||
                      ""
                  );
                  if (
                    currentId &&
                    !options.some(
                      (person) =>
                        String(person._id || person.id) === currentId
                    )
                  ) {
                    options.unshift({
                      _id: currentId,
                      name:
                        initialData?.author?.name ||
                        `Author ${currentId}`,
                    });
                  }
                  return options.map((person) => {
                    const id = String(person._id || person.id || "");
                    if (!id) return null;
                    return (
                      <option key={id} value={id}>
                        {person.name || person.email || `Author ${id}`}
                      </option>
                    );
                  });
                })()}
              </select>
              <p className="mt-1.5 text-xs text-slate-400">
                Change this to credit a different author on the article details
                page.
              </p>
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
              <FieldLabel hint="Search existing or create new">Tags</FieldLabel>
              <div className="space-y-2">
                {selectedTagObjects.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedTagObjects.map((tag) => (
                      <button
                        key={tag._id}
                        type="button"
                        onClick={() => toggleTag(tag._id)}
                        className="px-3 py-1.5 rounded-full text-sm border bg-blue-600 text-white border-blue-600"
                        title="Remove tag"
                      >
                        {tag.name} ×
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="flex gap-2">
                  <input
                    value={tagQuery}
                    onChange={(e) => setTagQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (exactTagMatch) {
                          toggleTag(exactTagMatch._id);
                          setTagQuery("");
                        } else if (canCreateTag) {
                          handleCreateTag();
                        }
                      }
                    }}
                    placeholder={
                      tags.length
                        ? `Search or create tags (${tags.length})…`
                        : "Type a new tag name…"
                    }
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white"
                  />
                  <button
                    type="button"
                    disabled={!canCreateTag && !exactTagMatch}
                    onClick={() => {
                      if (exactTagMatch) {
                        toggleTag(exactTagMatch._id);
                        setTagQuery("");
                        return;
                      }
                      handleCreateTag();
                    }}
                    className="shrink-0 px-3 py-2 rounded-lg text-sm font-semibold border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {creatingTag
                      ? "Adding…"
                      : exactTagMatch
                        ? "Add"
                        : "Create"}
                  </button>
                </div>

                {canCreateTag ? (
                  <button
                    type="button"
                    onClick={handleCreateTag}
                    className="text-sm font-semibold text-accent hover:underline"
                  >
                    Create new tag “{tagQueryTrimmed}” and add it
                  </button>
                ) : null}

                {tags.length === 0 && !tagQueryTrimmed ? (
                  <p className="text-sm text-slate-400">
                    No tags yet. Type a name above and click Create.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                    {tagMatches.length ? (
                      tagMatches.map((tag) => (
                        <button
                          key={tag._id}
                          type="button"
                          onClick={() => toggleTag(tag._id)}
                          className="px-3 py-1.5 rounded-full text-sm border transition bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-300"
                        >
                          {tag.name}
                        </button>
                      ))
                    ) : tagQueryTrimmed && !canCreateTag ? (
                      <p className="text-sm text-slate-400">
                        Tag already selected or no matches.
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
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
                    Pins the story in Top News
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
                  checked={explainer}
                  onChange={(e) => setExplainer(e.target.checked)}
                />
                <span>
                  <span className="font-medium text-slate-800">Explainer</span>
                  <span className="block text-xs text-slate-500">
                    Shows in the homepage Explainer section
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

            {(initialData?._id || initialData?.id) &&
            (status === "published" || status === "publish") ? (
              <button
                type="button"
                onClick={() =>
                  openPublicArticle(
                    {
                      ...initialData,
                      slug: slug || initialData.slug,
                      category:
                        categories.find(
                          (cat) => String(cat._id) === String(category)
                        ) || initialData.category,
                    },
                    "admin"
                  )
                }
                className="w-full inline-flex items-center justify-center gap-2 border border-slate-300 bg-white hover:bg-slate-50 text-ink font-semibold px-6 py-3 rounded-lg transition"
              >
                <Eye size={18} />
                View
              </button>
            ) : null}
            <button
              type="submit"
              disabled={saving || autoSaving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              {saving ? "Saving…" : submitText}
            </button>
            {typeof onAutoSave === "function" ? (
              <div className="flex items-center justify-center gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      autoSaving ? "animate-pulse bg-amber-500" : "bg-emerald-500"
                    }`}
                  />
                  Auto save
                </span>
                <span className="text-slate-500">
                  {autoSaving
                    ? "Saving…"
                    : autoSaveNote
                      ? `Last saved ${autoSaveNote}`
                      : "Waiting for first save"}
                </span>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </form>
  );
}

export default ArticleForm;
