import React from "react";
import { EmptyState } from "../ui/PageUI";
import { getImageUrl } from "../../utils/media";

const MediaGallery = ({ media, onDelete }) => {
  if (!media?.length) {
    return (
      <EmptyState
        title="No media found"
        description="Upload images to use in your articles."
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
            <p className="text-xs text-ink-muted capitalize mt-1">
              {item.type || "image"}
            </p>
            <button
              type="button"
              onClick={() => onDelete(item._id)}
              className="cms-btn-danger w-full mt-3 text-xs py-1.5"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaGallery;
