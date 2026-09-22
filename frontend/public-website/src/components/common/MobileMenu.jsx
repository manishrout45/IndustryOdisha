import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { X, Mail, Phone, MapPin } from "lucide-react";
import logo from "../../assets/logos/industryodishalogo.png";

const ABOUT_TEXT =
  "Trusted headlines, analysis and local stories — delivered with clarity for readers across Odisha and beyond.";

const CONTACT = {
  email: "info@industryodisha.com",
  phone: "+91 94370 00000",
  address: "Bhubaneswar, Odisha, India",
};

function FacebookIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14C17.17 2.09 16.02 2 14.79 2 11.93 2 10 3.82 10 7.29V9.5H7v4h3V22h4v-8.5z" />
    </svg>
  );
}

function XIcon({ size = 17 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.851L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 0 1 12 7.5zm0 2A2.5 2.5 0 1 0 14.5 12 2.5 2.5 0 0 0 12 9.5zm5.75-3.25a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25z" />
    </svg>
  );
}

function YoutubeIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/industryodisha",
    Icon: FacebookIcon,
  },
  {
    label: "X (Twitter)",
    href: "https://twitter.com/industryodisha",
    Icon: XIcon,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/industryodisha",
    Icon: InstagramIcon,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@industryodisha",
    Icon: YoutubeIcon,
  },
];

export default function MobileMenu({ open, setOpen }) {
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onEscape = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onEscape);

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 bg-ink/50 z-[60] transition-opacity duration-300 ${
          open ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        aria-hidden={!open}
      />

      <aside
        className={`mobile-menu-panel fixed top-0 left-0 h-screen w-[min(88vw,360px)] bg-white z-[70] shadow-2xl flex flex-col ${
          open ? "mobile-menu-panel--open" : "pointer-events-none"
        }`}
        aria-hidden={!open}
        aria-label="About and contact"
      >
        <div className="relative flex-1 overflow-y-auto px-6 pt-6 pb-8 bg-gradient-to-b from-slate-50 to-white">
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 p-2 rounded-full text-ink-muted hover:bg-slate-100 hover:text-ink transition"
            aria-label="Close menu"
          >
            <X size={22} />
          </button>

          <Link to="/" onClick={close} className="inline-block mb-4">
            <img
              src={logo}
              alt="Industry Odisha"
              className="h-12 object-contain"
            />
          </Link>

          <p className="text-sm text-ink-muted leading-relaxed pr-8">
            {ABOUT_TEXT}
          </p>

          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] font-bold uppercase tracking-widest text-ink-muted mb-3">
              Contact
            </p>
            <div className="space-y-3">
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-2.5 text-sm text-ink hover:text-accent transition"
              >
                <Mail size={16} className="shrink-0 text-accent" />
                <span className="break-all">{CONTACT.email}</span>
              </a>
              <a
                href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2.5 text-sm text-ink hover:text-accent transition"
              >
                <Phone size={16} className="shrink-0 text-accent" />
                <span>{CONTACT.phone}</span>
              </a>
              <div className="flex items-start gap-2.5 text-sm text-ink-muted">
                <MapPin size={16} className="shrink-0 text-accent mt-0.5" />
                <span>{CONTACT.address}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] font-bold uppercase tracking-widest text-ink-muted mb-3">
              Follow us
            </p>
            <div className="flex items-center gap-2.5">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-ink text-white hover:bg-accent transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 flex gap-4 text-sm">
            <Link
              to="/about"
              onClick={close}
              className="text-accent font-semibold hover:underline"
            >
              About us
            </Link>
            <Link
              to="/contact"
              onClick={close}
              className="text-accent font-semibold hover:underline"
            >
              Contact page
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
