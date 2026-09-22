import React, { useEffect, useState } from "react";
import { Play, X } from "lucide-react";
import axiosInstance from "../../services/axiosInstance";
import SectionHeading from "../common/SectionHeading";
import { getImageUrl } from "../../utils/media";

function VideoSection({ title = "Videos", limit = 6 }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  useEffect(() => {
    axiosInstance
      .get(`/videos?limit=${limit}`)
      .then((res) => {
        const list = res.data?.data ?? res.data ?? [];
        setVideos(Array.isArray(list) ? list : []);
      })
      .catch(() => setVideos([]))
      .finally(() => setLoading(false));
  }, [limit]);

  return (
    <section className="mb-10">
      <SectionHeading title={title} subtitle="From Industry Odisha" />

      {loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-video bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : !videos.length ? (
        <div className="news-rail p-6 text-sm text-ink-muted text-center">
          No videos published yet. Upload them from Admin → Videos.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {videos.map((item) => (
            <button
              key={item._id}
              type="button"
              onClick={() => setActive(item)}
              className="group text-left"
            >
              <div className="relative aspect-video overflow-hidden bg-ink">
                {item.thumbnailUrl ? (
                  <img
                    src={getImageUrl(item.thumbnailUrl)}
                    alt=""
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <video
                    src={getImageUrl(item.videoUrl)}
                    muted
                    preload="metadata"
                    className="w-full h-full object-cover opacity-90"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-accent/95 text-white flex items-center justify-center shadow-lg">
                    <Play size={20} fill="currentColor" className="ml-0.5" />
                  </span>
                </span>
                <div className="absolute bottom-0 p-3 sm:p-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                    {item.categoryLabel || "Video"}
                  </span>
                  <h3 className="font-display font-semibold text-sm sm:text-base mt-1 line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {active ? (
        <div
          className="fixed inset-0 z-[80] bg-ink/70 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[92vh] bg-black shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 inline-flex items-center gap-1 text-sm"
            >
              <X size={18} />
              <span className="sr-only sm:not-sr-only sm:inline">Close</span>
            </button>
            <div className="aspect-video bg-black">
              <video
                key={active._id}
                src={getImageUrl(active.videoUrl)}
                controls
                autoPlay
                playsInline
                preload="metadata"
                className="w-full h-full"
              />
            </div>
            <div className="p-4 bg-white">
              <h3 className="font-display font-bold text-ink pr-10">{active.title}</h3>
              {active.description ? (
                <p className="text-sm text-ink-muted mt-1">{active.description}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default VideoSection;
