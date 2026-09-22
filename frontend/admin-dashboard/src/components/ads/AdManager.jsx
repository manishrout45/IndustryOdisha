import React, { useEffect, useState } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
import { createAd, deleteAd, getAds, updateAd } from "../../services/adService";
import { getImageUrl } from "../../utils/media";
import { EmptyState } from "../ui/PageUI";

const POSITIONS = [
  { value: "header-top", label: "Header top (above site header)" },
  { value: "header", label: "Header (under navbar)" },
  { value: "homepage", label: "Homepage banner" },
  { value: "homepage-after-hero", label: "Homepage — after Top News" },
  { value: "homepage-mid", label: "Homepage — mid sections" },
  { value: "homepage-bottom", label: "Homepage — before videos" },
  { value: "sidebar", label: "Sidebar" },
  { value: "in-article", label: "Inside article pages" },
  { value: "category-top", label: "Category pages" },
  { value: "footer", label: "Footer" },
];

const ALL_VALUES = POSITIONS.map((p) => p.value);

const emptyForm = {
  title: "",
  positions: ["header-top"],
  allPositions: false,
  targetUrl: "",
  isActive: true,
};

function adPositions(ad) {
  if (ad?.allPositions) return [...ALL_VALUES];
  if (Array.isArray(ad?.positions) && ad.positions.length) return ad.positions;
  if (ad?.position) return [ad.position];
  return [];
}

function AdManager() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await getAds();
      setAds(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const clearImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImageFile(null);
    setPreview("");
  };

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file (JPG, PNG, WebP, etc.).");
      e.target.value = "";
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    e.target.value = "";
  };

  const togglePosition = (value) => {
    setForm((f) => {
      if (f.allPositions) return f;
      const has = f.positions.includes(value);
      const positions = has
        ? f.positions.filter((p) => p !== value)
        : [...f.positions, value];
      return { ...f, positions };
    });
  };

  const selectAllPositions = () => {
    setForm((f) => ({
      ...f,
      allPositions: true,
      positions: [...ALL_VALUES],
    }));
  };

  const clearAllPositions = () => {
    setForm((f) => ({
      ...f,
      allPositions: false,
      positions: [],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (!imageFile) {
      alert("Please upload an ad image.");
      return;
    }
    if (!form.allPositions && form.positions.length === 0) {
      alert("Select at least one display position, or choose All positions.");
      return;
    }
    try {
      setSaving(true);
      await createAd(form, imageFile);
      clearImage();
      setForm(emptyForm);
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create ad");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ad) => {
    try {
      await updateAd(ad._id, { isActive: !ad.isActive });
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this advertisement?")) return;
    try {
      await deleteAd(id);
      setAds((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  const positionLabel = (value) =>
    POSITIONS.find((p) => p.value === value)?.label || value;

  const formatPositions = (ad) => {
    if (ad.allPositions) return "All positions";
    const list = adPositions(ad);
    if (!list.length) return "No position";
    if (list.length === 1) return positionLabel(list[0]);
    return `${list.length} positions: ${list.map(positionLabel).join(", ")}`;
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <form onSubmit={handleSubmit} className="lg:col-span-4 cms-card p-5 space-y-4">
        <div>
          <h3 className="font-semibold text-ink">Create advertisement</h3>
          <p className="text-xs text-ink-muted mt-1">
            One ad can run everywhere, in selected slots, or create separate ads
            per position
          </p>
        </div>

        <div>
          <label className="cms-label">Title</label>
          <input
            className="cms-input"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <label className="cms-label mb-0">Display positions</label>
            <div className="flex gap-2">
              <button
                type="button"
                className="text-xs font-semibold text-accent hover:underline"
                onClick={selectAllPositions}
              >
                All places
              </button>
              <button
                type="button"
                className="text-xs font-semibold text-ink-muted hover:underline"
                onClick={clearAllPositions}
              >
                Clear
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm mb-3 p-2.5 rounded-lg bg-accent-softbg/60 border border-accent/10">
            <input
              type="checkbox"
              checked={form.allPositions}
              onChange={(e) => {
                const checked = e.target.checked;
                setForm((f) => ({
                  ...f,
                  allPositions: checked,
                  positions: checked ? [...ALL_VALUES] : f.positions,
                }));
              }}
            />
            <span className="font-medium text-ink">
              Run this ad in all display positions
            </span>
          </label>

          <div
            className={`max-h-52 overflow-y-auto space-y-1.5 rounded-lg border border-slate-200 p-2 ${
              form.allPositions ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {POSITIONS.map((p) => {
              const checked =
                form.allPositions || form.positions.includes(p.value);
              return (
                <label
                  key={p.value}
                  className="flex items-start gap-2 text-sm px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={checked}
                    disabled={form.allPositions}
                    onChange={() => togglePosition(p.value)}
                  />
                  <span className="text-ink leading-snug">{p.label}</span>
                </label>
              );
            })}
          </div>
          <p className="text-[11px] text-ink-muted mt-1.5">
            {form.allPositions
              ? "Showing on every ad slot across the site"
              : `${form.positions.length} selected — create another ad if you want a different image for other slots`}
          </p>
        </div>

        <div>
          <label className="cms-label">Ad image</label>
          {preview ? (
            <div className="relative mt-1 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
              <img
                src={preview}
                alt="Ad preview"
                className="w-full h-40 object-contain"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 border border-slate-200 text-ink-muted hover:text-ink"
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
              <p className="px-3 py-2 text-xs text-ink-muted truncate border-t border-slate-100">
                {imageFile?.name}
              </p>
            </div>
          ) : (
            <label className="mt-1 flex flex-col items-center justify-center gap-2 h-40 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:border-ink/30 hover:bg-slate-100/80 transition">
              <ImagePlus size={28} className="text-ink-muted" />
              <span className="text-sm font-medium text-ink">
                Click to upload ad image
              </span>
              <span className="text-xs text-ink-muted">JPG, PNG, WebP</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImagePick}
              />
            </label>
          )}
          {preview ? (
            <label className="cms-btn-ghost mt-2 inline-flex items-center gap-2 cursor-pointer">
              <Upload size={16} />
              Change image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImagePick}
              />
            </label>
          ) : null}
        </div>

        <div>
          <label className="cms-label">Click-through URL</label>
          <input
            className="cms-input"
            value={form.targetUrl}
            onChange={(e) =>
              setForm((f) => ({ ...f, targetUrl: e.target.value }))
            }
            placeholder="https://advertiser.example"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) =>
              setForm((f) => ({ ...f, isActive: e.target.checked }))
            }
          />
          Active
        </label>

        <button
          type="submit"
          disabled={
            saving ||
            !imageFile ||
            (!form.allPositions && form.positions.length === 0)
          }
          className="cms-btn-primary w-full"
        >
          {saving ? "Saving…" : "Save advertisement"}
        </button>
      </form>

      <div className="lg:col-span-8">
        {loading ? (
          <div className="cms-card p-8 text-center text-ink-muted">Loading…</div>
        ) : ads.length === 0 ? (
          <EmptyState
            title="No ads yet"
            description="Upload an image, pick one or more positions, and go live."
          />
        ) : (
          <div className="space-y-3">
            {ads.map((ad) => (
              <div
                key={ad._id}
                className="cms-card p-3 flex flex-col sm:flex-row gap-4"
              >
                <img
                  src={getImageUrl(
                    ad.imageUrl,
                    "https://placehold.co/160x100?text=Ad"
                  )}
                  alt=""
                  className="w-full sm:w-40 h-28 object-contain rounded-lg border border-slate-200 bg-slate-50 shrink-0"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/160x100?text=Ad";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold text-ink">{ad.title}</h4>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        ad.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {ad.isActive ? "Active" : "Off"}
                    </span>
                    {ad.allPositions ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700">
                        All slots
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                    {formatPositions(ad)}
                  </p>
                  {ad.targetUrl ? (
                    <p className="text-xs text-ink-muted mt-1 truncate">
                      {ad.targetUrl}
                    </p>
                  ) : null}
                  <p className="text-xs text-ink-muted mt-1">
                    {ad.clicks || 0} clicks · {ad.impressions || 0} impressions
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      className="cms-btn-ghost text-xs py-1.5"
                      onClick={() => toggleActive(ad)}
                    >
                      {ad.isActive ? "Disable" : "Enable"}
                    </button>
                    <button
                      type="button"
                      className="cms-btn-danger text-xs py-1.5"
                      onClick={() => handleDelete(ad._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdManager;
