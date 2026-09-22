import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../services/axiosInstance";
import { articlePath } from "../../utils/media";

function BreakingLiveBadge() {
  const [mode, setMode] = useState("breaking");
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    let flipTimer;
    const id = setInterval(() => {
      setFlipping(true);
      clearTimeout(flipTimer);
      flipTimer = setTimeout(() => {
        setMode((prev) => (prev === "breaking" ? "live" : "breaking"));
        setFlipping(false);
      }, 520);
    }, 3000);

    return () => {
      clearInterval(id);
      clearTimeout(flipTimer);
    };
  }, []);

  return (
    <div
      className={`breaking-badge ${flipping ? "is-flipping" : ""}`}
      aria-live="polite"
    >
      <span className="breaking-badge__glass" aria-hidden />
      <div className="breaking-badge__inner">
        {mode === "live" ? (
          <span className="breaking-badge__live">
            <span className="breaking-badge__dot" aria-hidden />
            Live
          </span>
        ) : (
          <span className="breaking-badge__text">Breaking</span>
        )}
      </div>
    </div>
  );
}

function BreakingNews() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axiosInstance
      .get("/breaking-news?limit=8")
      .then((res) => {
        const list =
          res.data?.data?.articles ||
          res.data?.data ||
          res.data?.articles ||
          [];
        setItems(Array.isArray(list) ? list : []);
      })
      .catch(() => setItems([]));
  }, []);

  if (!items.length) return null;

  const loop = [...items, ...items];

  return (
    <div className="bg-accent text-white">
      <div className="max-w-site mx-auto flex items-stretch">
        <div className="flex-shrink-0 px-2.5 sm:px-4 py-2 sm:py-2.5 bg-ink font-bold text-[11px] sm:text-sm tracking-wider uppercase flex items-center min-w-[5.25rem] sm:min-w-[7.5rem] justify-center">
          <BreakingLiveBadge />
        </div>

        <div className="overflow-hidden flex-1 min-w-0 py-2 sm:py-2.5">
          <div className="breaking-marquee">
            {loop.map((item, index) => (
              <Link
                key={`${item._id}-${index}`}
                to={articlePath(item)}
                className="inline-flex items-center px-4 sm:px-6 text-xs sm:text-[15px] font-medium hover:underline whitespace-nowrap"
              >
                <span className="mr-2 opacity-70">●</span>
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BreakingNews;
