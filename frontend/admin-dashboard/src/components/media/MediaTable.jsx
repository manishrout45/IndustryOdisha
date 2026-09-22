import React, { useEffect, useState } from "react";
import { getMedia, deleteMedia } from "../../services/mediaService";
import { EmptyState } from "../ui/PageUI";
import { getImageUrl, formatShortDate } from "../../utils/media";

function MediaTable({ refreshKey = 0 }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const data = await getMedia();
      setMedia(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [refreshKey]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this media?")) return;
    try {
      await deleteMedia(id);
      setMedia((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      alert("Failed to delete media.");
    }
  };

  if (loading) {
    return (
      <div className="cms-card p-8 text-center text-ink-muted">
        Loading media…
      </div>
    );
  }

  if (!media.length) {
    return (
      <EmptyState
        title="No media yet"
        description="Upload images to reuse across stories."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {media.map((item) => (
        <div key={item._id} className="cms-card overflow-hidden">
          <img
            src={getImageUrl(item.url)}
            alt={item.altText || item.originalName || "Media"}
            className="w-full h-40 object-cover bg-slate-100"
          />
          <div className="p-3">
            <h4 className="font-medium text-sm line-clamp-2">
              {item.caption || item.altText || item.originalName}
            </h4>
            <div className="mt-2 flex items-center justify-between text-[11px] text-ink-muted">
              <span className="capitalize">{item.type || "image"}</span>
              <span>{formatShortDate(item.createdAt)}</span>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(item._id)}
              className="cms-btn-danger w-full mt-3 text-xs py-1.5"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default MediaTable;
