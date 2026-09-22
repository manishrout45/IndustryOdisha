import React, { useEffect, useState } from "react";
import axiosInstance from "../../services/axiosInstance";
import { getImageUrl } from "../../utils/media";

/**
 * Renders active ads for a given position slot.
 * size: "leaderboard" | "banner" | "rectangle" | "inline"
 */
export default function AdSlot({
  position,
  size = "banner",
  className = "",
  label = "Advertisement",
}) {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    let cancelled = false;
    axiosInstance
      .get("/ads", { params: { position } })
      .then((res) => {
        const list = res.data?.data || res.data || [];
        if (!cancelled) setAds(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setAds([]);
      });
    return () => {
      cancelled = true;
    };
  }, [position]);

  if (!ads.length) return null;

  const heightClass =
    size === "leaderboard"
      ? "min-h-[70px] md:min-h-[90px]"
      : size === "rectangle"
        ? "min-h-[200px]"
        : size === "inline"
          ? "min-h-[80px]"
          : "min-h-[100px] md:min-h-[120px]";

  const trackClick = async (id) => {
    try {
      await axiosInstance.post(`/ads/${id}/click`);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={`w-full py-1 ${className}`}>
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 text-center mb-1.5">
        {label}
      </p>
      <div className="space-y-3">
        {ads.map((ad) => {
          const img = (
            <img
              src={getImageUrl(ad.imageUrl, "")}
              alt={ad.title || "Advertisement"}
              className={`w-full ${heightClass} object-contain bg-slate-50 border border-slate-100`}
            />
          );

          if (ad.targetUrl) {
            return (
              <a
                key={ad._id}
                href={ad.targetUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() => trackClick(ad._id)}
                className="block hover:opacity-95 transition"
              >
                {ad.imageUrl ? (
                  img
                ) : (
                  <div
                    className={`${heightClass} flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 text-sm text-slate-400`}
                  >
                    {ad.title}
                  </div>
                )}
              </a>
            );
          }

          return (
            <div key={ad._id}>
              {ad.imageUrl ? (
                img
              ) : (
                <div
                  className={`${heightClass} flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 text-sm text-slate-400`}
                >
                  {ad.title}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
