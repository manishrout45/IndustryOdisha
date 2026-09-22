import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Upload, X, Film } from "lucide-react";
import {
  createVideo,
  deleteVideo,
  getVideos,
  updateVideo,
  MAX_VIDEO_BYTES,
} from "../../services/videoService";
import { getImageUrl } from "../../utils/media";
import { EmptyState } from "../ui/PageUI";

const emptyForm = {
  title: "",
  categoryLabel: "Video",
  description: "",
  order: 0,
  isActive: true,
  thumbnailUrl: "",
  videoUrl: "",
  originalName: "",
  fileSize: 0,
};

function formatBytes(bytes = 0) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function VideoManager() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [preview, setPreview] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const data = await getVideos();
      setVideos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setVideos([]);
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

  const resetForm = () => {
    if (preview) URL.revokeObjectURL(preview);
    setForm(emptyForm);
    setEditId(null);
    setVideoFile(null);
    setThumbFile(null);
    setPreview("");
  };

  const handleVideoPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const okType =
      file.type === "video/mp4" ||
      file.type === "video/webm" ||
      file.type === "video/quicktime";

    if (!okType) {
      alert("Please upload MP4 or WebM (recommended for fast loading).");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_VIDEO_BYTES) {
      alert(
        `Video is too large (${formatBytes(file.size)}). Max size is 120 MB. Compress the file for faster homepage loading.`
      );
      e.target.value = "";
      return;
    }

    if (file.size > 80 * 1024 * 1024) {
      const proceed = window.confirm(
        `This file is ${formatBytes(file.size)}. For faster homepage loading, keep videos under ~80 MB when possible. Continue upload?`
      );
      if (!proceed) {
        e.target.value = "";
        return;
      }
    }

    setVideoFile(file);
  };

  const handleThumbPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image for the thumbnail.");
      e.target.value = "";
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setThumbFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const startEdit = (video) => {
    setEditId(video._id);
    setForm({
      title: video.title || "",
      categoryLabel: video.categoryLabel || "Video",
      description: video.description || "",
      order: video.order ?? 0,
      isActive: video.isActive !== false,
      thumbnailUrl: video.thumbnailUrl || "",
      videoUrl: video.videoUrl || "",
      originalName: video.originalName || "",
      fileSize: video.fileSize || 0,
    });
    setVideoFile(null);
    setThumbFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("Title is required.");
      return;
    }
    if (!editId && !videoFile) {
      alert("Please upload a video file (MP4/WebM, max 120MB).");
      return;
    }

    try {
      setSaving(true);
      if (editId) {
        await updateVideo(editId, form, videoFile, thumbFile);
      } else {
        await createVideo(form, videoFile, thumbFile);
      }
      resetForm();
      await load();
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message ||
        (err?.code === "ECONNABORTED"
          ? "Upload timed out. Try a smaller / compressed video."
          : "Failed to save video");
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this video from the homepage?")) return;
    try {
      await deleteVideo(id);
      if (editId === id) resetForm();
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete video");
    }
  };

  const toggleActive = async (video) => {
    try {
      await updateVideo(video._id, { isActive: !video.isActive });
      await load();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update status");
    }
  };

  const thumbSrc =
    preview ||
    (form.thumbnailUrl ? getImageUrl(form.thumbnailUrl) : "");

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <form onSubmit={handleSubmit} className="lg:col-span-2 cms-card p-5 space-y-4">
        <div>
          <h2 className="font-semibold text-ink">
            {editId ? "Edit video" : "Upload video"}
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            Upload MP4 or WebM (max <strong>120 MB</strong>). Prefer under 80 MB
            and H.264 MP4 for fast homepage loading.
          </p>
        </div>

        <div>
          <label className="cms-label">Title</label>
          <input
            className="cms-input"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            placeholder="e.g. CM reviews industrial corridor"
          />
        </div>

        <div>
          <label className="cms-label">Video file</label>
          <label className="mt-1 flex flex-col items-center justify-center gap-2 border border-dashed border-slate-300 rounded-lg p-5 cursor-pointer hover:border-accent/50 hover:bg-slate-50 transition">
            <Film size={22} className="text-ink-muted" />
            <span className="text-sm font-medium text-ink">
              {videoFile
                ? videoFile.name
                : editId && form.originalName
                  ? `Keep current: ${form.originalName}`
                  : editId && form.videoUrl
                    ? "Keep current video (or replace)"
                    : "Choose video file"}
            </span>
            <span className="text-xs text-ink-muted">
              {videoFile
                ? formatBytes(videoFile.size)
                : editId && form.fileSize
                  ? formatBytes(form.fileSize)
                  : "MP4 / WebM · max 120 MB"}
            </span>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              className="hidden"
              onChange={handleVideoPick}
            />
          </label>
          {videoFile ? (
            <button
              type="button"
              className="text-xs text-accent mt-2"
              onClick={() => setVideoFile(null)}
            >
              Remove selected file
            </button>
          ) : null}
        </div>

        <div>
          <label className="cms-label">Category label</label>
          <input
            className="cms-input"
            value={form.categoryLabel}
            onChange={(e) =>
              setForm((f) => ({ ...f, categoryLabel: e.target.value }))
            }
            placeholder="Video"
          />
        </div>

        <div>
          <label className="cms-label">Description (optional)</label>
          <textarea
            className="cms-input"
            rows={2}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="cms-label">Order</label>
          <input
            type="number"
            className="cms-input"
            value={form.order}
            onChange={(e) =>
              setForm((f) => ({ ...f, order: Number(e.target.value) || 0 }))
            }
          />
        </div>

        <div>
          <label className="cms-label">Thumbnail (optional)</label>
          {thumbSrc ? (
            <div className="relative mb-2 mt-1">
              <img
                src={thumbSrc}
                alt=""
                className="w-full aspect-video object-cover bg-slate-100 rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  if (preview) URL.revokeObjectURL(preview);
                  setPreview("");
                  setThumbFile(null);
                  setForm((f) => ({ ...f, thumbnailUrl: "" }));
                }}
                className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full"
              >
                <X size={14} />
              </button>
            </div>
          ) : null}
          <label className="cms-btn-ghost inline-flex items-center gap-2 cursor-pointer mt-1">
            <Upload size={16} />
            {thumbSrc ? "Replace thumbnail" : "Upload thumbnail"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleThumbPick}
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) =>
              setForm((f) => ({ ...f, isActive: e.target.checked }))
            }
          />
          Active on homepage
        </label>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="cms-btn-primary flex-1"
          >
            {saving
              ? "Uploading… (large files may take a minute)"
              : editId
                ? "Update video"
                : "Upload video"}
          </button>
          {editId ? (
            <button type="button" onClick={resetForm} className="cms-btn-ghost">
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="lg:col-span-3 cms-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-ink">Homepage videos</h2>
          <span className="text-xs text-ink-muted">{videos.length} items</span>
        </div>

        {loading ? (
          <p className="text-sm text-ink-muted">Loading…</p>
        ) : !videos.length ? (
          <EmptyState
            title="No videos yet"
            description="Upload an MP4/WebM file to show it on the public homepage."
          />
        ) : (
          <ul className="space-y-3">
            {videos.map((video) => (
              <li
                key={video._id}
                className="flex gap-3 border border-slate-200 rounded-lg p-3"
              >
                <img
                  src={getImageUrl(
                    video.thumbnailUrl,
                    "https://placehold.co/160x90?text=Video"
                  )}
                  alt=""
                  className="w-28 h-16 object-cover bg-slate-100 shrink-0 rounded"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-ink truncate">
                      {video.title}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        video.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {video.isActive ? "Active" : "Off"}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted mt-0.5 truncate">
                    {video.categoryLabel || "Video"}
                    {video.fileSize ? ` · ${formatBytes(video.fileSize)}` : ""}
                    {` · order ${video.order ?? 0}`}
                  </p>
                  <p className="text-[11px] text-ink-muted truncate mt-0.5">
                    {video.originalName || video.videoUrl}
                  </p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(video)}
                    className="cms-btn-ghost text-xs py-1.5 inline-flex items-center gap-1"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleActive(video)}
                    className="cms-btn-ghost text-xs py-1.5"
                  >
                    {video.isActive ? "Disable" : "Enable"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(video._id)}
                    className="cms-btn-danger text-xs py-1.5 inline-flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default VideoManager;
