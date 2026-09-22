import React, { useEffect, useState } from "react";
import { PageHeader } from "../components/ui/PageUI";
import UploadMedia from "../components/media/UploadMedia";
import MediaGallery from "../components/media/MediaGallery";
import { getMediaFiles, deleteMedia } from "../services/mediaService";

const MediaLibrary = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await getMediaFiles();
      if (Array.isArray(response)) setMedia(response);
      else if (response?.media) setMedia(response.media);
      else if (response?.data?.media) setMedia(response.data.media);
      else if (response?.data) setMedia(response.data);
      else setMedia([]);
    } catch (error) {
      console.error(error);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this media?")) return;
    try {
      await deleteMedia(id);
      setMedia((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      alert("Failed to delete media.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media library"
        subtitle="Upload photos for your stories"
        action={
          <button type="button" onClick={fetchMedia} className="cms-btn-ghost">
            Refresh
          </button>
        }
      />

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <UploadMedia onUpload={fetchMedia} />
        </div>
        <div className="lg:col-span-8">
          {loading ? (
            <div className="cms-card p-8 text-center text-ink-muted">
              Loading media…
            </div>
          ) : (
            <MediaGallery media={media} onDelete={handleDelete} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaLibrary;
