import React from "react";
import { getImageUrl } from "../../utils/media";

function AuthorInfo({ author }) {
  const name = author?.name || "Staff Reporter";
  const role = author?.role || "Correspondent";
  const bio =
    author?.bio ||
    "Reports for Industry Odisha on politics, policy and public affairs across the state.";

  const dummyAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=0c2340&color=ffffff&size=200&bold=true&format=png`;

  const avatarSrc = author?.avatar
    ? getImageUrl(author.avatar, dummyAvatar)
    : dummyAvatar;

  return (
    <aside className="flex gap-4 sm:gap-5 items-start">
      <img
        src={avatarSrc}
        alt={name}
        className="w-16 h-16 sm:w-[76px] sm:h-[76px] rounded-full object-cover bg-ink shrink-0 ring-2 ring-slate-100"
        onError={(e) => {
          e.currentTarget.src = dummyAvatar;
        }}
      />
      <div className="min-w-0 pt-0.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted mb-1">
          About the author
        </p>
        <h3 className="font-display text-xl font-bold text-ink leading-tight">
          {name}
        </h3>
        <p className="text-[12px] text-accent font-semibold mt-0.5">{role}</p>
        <p className="mt-2.5 text-[14px] text-ink-muted leading-relaxed">{bio}</p>
      </div>
    </aside>
  );
}

export default AuthorInfo;
