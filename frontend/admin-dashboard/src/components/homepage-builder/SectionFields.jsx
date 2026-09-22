import React, { useEffect, useState } from "react";
import { getCategories } from "../../services/categoryService";
import { flattenCategories } from "../../utils/categories";

export const SECTION_TYPES = [
  { value: "breaking-news", label: "Breaking news" },
  { value: "hero", label: "Top News / Featured" },
  { value: "latest", label: "Latest news" },
  { value: "dont-miss", label: "Don't Miss" },
  { value: "trending", label: "Trending" },
  { value: "most-read", label: "Most Read" },
  { value: "category-block", label: "Category sections" },
  { value: "video", label: "Videos" },
  { value: "media-gallery", label: "Media gallery" },
  { value: "custom-html", label: "Custom HTML" },
];

export function sectionTypeLabel(type) {
  return SECTION_TYPES.find((t) => t.value === type)?.label || type;
}

/**
 * Shared fields for create + edit homepage sections.
 */
function SectionFields({
  value,
  onChange,
  loading = false,
  allowTypeChange = true,
}) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories()
      .then((res) => {
        const list = res?.data || res?.categories || res || [];
        setCategories(flattenCategories(Array.isArray(list) ? list : []));
      })
      .catch(() => setCategories([]));
  }, []);

  const set = (patch) => onChange({ ...value, ...patch });
  const setConfig = (patch) =>
    onChange({
      ...value,
      config: { ...(value.config || {}), ...patch },
    });

  const type = value.type || "latest";
  const config = value.config || {};

  return (
    <div className="space-y-4">
      <div>
        <label className="cms-label">Section title</label>
        <input
          className="cms-input"
          value={value.title || ""}
          onChange={(e) => set({ title: e.target.value })}
          disabled={loading}
          required
          placeholder="e.g. Latest from Odisha"
        />
      </div>

      <div>
        <label className="cms-label">Section type</label>
        <select
          className="cms-input"
          value={type}
          onChange={(e) => set({ type: e.target.value })}
          disabled={loading || !allowTypeChange}
        >
          {SECTION_TYPES.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {!allowTypeChange ? (
          <p className="text-xs text-ink-muted mt-1">
            Type is locked for existing sections to keep the layout stable.
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="cms-label">Story limit</label>
          <input
            type="number"
            min="1"
            max="24"
            className="cms-input"
            value={config.limit ?? 6}
            onChange={(e) => setConfig({ limit: Number(e.target.value) || 6 })}
            disabled={loading}
          />
        </div>
        <div className="flex flex-col justify-end gap-2 pb-1">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={value.isActive !== false}
              onChange={(e) => set({ isActive: e.target.checked })}
              disabled={loading}
            />
            Active on homepage
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={config.showTitle !== false}
              onChange={(e) => setConfig({ showTitle: e.target.checked })}
              disabled={loading}
            />
            Show section title
          </label>
        </div>
      </div>

      {type === "category-block" ? (
        <div>
          <label className="cms-label">Category (optional)</label>
          <select
            className="cms-input"
            value={config.categoryId || ""}
            onChange={(e) =>
              setConfig({ categoryId: e.target.value || null })
            }
            disabled={loading}
          >
            <option value="">All top categories (default)</option>
            {categories.map((cat) => (
              <option key={cat._id} value={String(cat._id)}>
                {cat.label || cat.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-ink-muted mt-1">
            Leave empty to show the default multi-category grid.
          </p>
        </div>
      ) : null}

      {type === "custom-html" ? (
        <div>
          <label className="cms-label">Custom HTML</label>
          <textarea
            className="cms-input min-h-[160px] font-mono text-sm"
            value={config.customHtml || ""}
            onChange={(e) => setConfig({ customHtml: e.target.value })}
            disabled={loading}
            placeholder="<div>Your homepage HTML…</div>"
          />
        </div>
      ) : null}
    </div>
  );
}

export default SectionFields;
