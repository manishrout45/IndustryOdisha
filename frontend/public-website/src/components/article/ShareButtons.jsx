import React, { useState } from "react";
import { Link2, Check } from "lucide-react";

function FacebookIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14C17.17 2.09 16.02 2 14.79 2 11.93 2 10 3.82 10 7.29V9.5H7v4h3V22h4v-8.5z" />
    </svg>
  );
}

function XIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.851L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function LinkedInIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6.94 6.5A2.44 2.44 0 1 1 6.94 1.6a2.44 2.44 0 0 1 0 4.9zM4.9 22V8.9h4.08V22H4.9zm6.35-13.1h3.91v1.8h.06c.54-1.03 1.87-2.11 3.85-2.11 4.12 0 4.88 2.71 4.88 6.24V22h-4.08v-6.54c0-1.56-.03-3.57-2.17-3.57-2.18 0-2.51 1.7-2.51 3.46V22h-4.08V8.9z" />
    </svg>
  );
}

function ShareButtons({ title = "" }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title || "Industry Odisha");

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const item =
    "inline-flex items-center justify-center w-8 h-8 rounded-full border border-slate-200 text-ink-muted hover:text-ink hover:border-ink transition";

  return (
    <div className="flex items-center gap-1.5">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        className={item}
        aria-label="Share on Facebook"
        title="Facebook"
      >
        <FacebookIcon />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noreferrer"
        className={item}
        aria-label="Share on X"
        title="X"
      >
        <XIcon />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        className={item}
        aria-label="Share on LinkedIn"
        title="LinkedIn"
      >
        <LinkedInIcon />
      </a>
      <button
        type="button"
        onClick={copyLink}
        className={item}
        aria-label="Copy link"
        title={copied ? "Copied" : "Copy link"}
      >
        {copied ? <Check size={14} /> : <Link2 size={14} />}
      </button>
    </div>
  );
}

export default ShareButtons;
