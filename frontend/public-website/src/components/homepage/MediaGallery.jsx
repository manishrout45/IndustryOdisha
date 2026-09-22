import React, { useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import SectionHeading from "../common/SectionHeading";

export default function MediaGallery({ title = "Media Gallery", limit = 8 }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get(`/media?limit=${limit}`)
      .then((res) => {
        const list = res.data?.data?.media || res.data?.data || [];
        setMedia(Array.isArray(list) ? list : []);
      })
      .catch(() => setMedia([]))
      .finally(() => setLoading(false));
  }, [limit]);

  return (
    <section className="my-12">
      <SectionHeading title={title} subtitle="From the newsroom" />

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[4/3] bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : !media.length ? (
        <div className="news-rail p-6 text-sm text-ink-muted text-center">
          No media uploaded yet. Add photos from the Media library in admin.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {media.slice(0, limit).map((item) => (
            <figure
              key={item._id}
              className="group relative overflow-hidden bg-slate-100 aspect-[4/3]"
            >
              <img
                src={item.url}
                alt={item.altText || item.originalName || "Photo"}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              {(item.caption || item.originalName) && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-ink/75 text-white text-[11px] sm:text-xs p-1.5 sm:p-2 line-clamp-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
                  {item.caption || item.originalName}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
