import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";
import { ChevronDown, Home, Menu } from "lucide-react";
import SearchSuggest from "./SearchSuggest";

function CategoryDropdownMenu({
  category,
  items,
  anchorRect,
  onClose,
  onKeepOpen,
}) {
  if (!anchorRect) return null;

  const style = {
    position: "fixed",
    top: anchorRect.bottom,
    left: Math.min(anchorRect.left, Math.max(8, window.innerWidth - 220)),
    zIndex: 200,
    minWidth: Math.max(200, anchorRect.width),
  };

  return createPortal(
    <div
      style={style}
      className="bg-white shadow-lg border border-slate-200 py-2 max-h-[70vh] overflow-y-auto"
      onMouseEnter={onKeepOpen}
      onMouseLeave={onClose}
    >
      <NavLink
        to={`/category/${category.slug}`}
        onClick={onClose}
        className={({ isActive }) =>
          `block px-4 py-2.5 text-sm border-b border-slate-100 ${
            isActive
              ? "bg-accent-softbg text-accent font-semibold"
              : "text-ink hover:bg-slate-50 font-medium"
          }`
        }
      >
        All {category.name}
      </NavLink>
      {items.map((sub) => (
        <NavLink
          key={sub._id}
          to={`/category/${sub.slug}`}
          onClick={onClose}
          className={({ isActive }) =>
            `block px-4 py-2.5 text-sm ${
              isActive
                ? "bg-accent-softbg text-accent font-semibold"
                : "text-ink hover:bg-slate-50"
            }`
          }
        >
          {sub.name}
        </NavLink>
      ))}
    </div>,
    document.body
  );
}

function CategoryNavItem({ category, linkClass }) {
  const [open, setOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const triggerRef = useRef(null);
  const closeTimer = useRef(null);

  const children = Array.isArray(category.children)
    ? category.children.filter((c) => c.isActive !== false)
    : [];
  const hasChildren = children.length > 0;

  const measure = () => {
    if (!triggerRef.current) return;
    setAnchorRect(triggerRef.current.getBoundingClientRect());
  };

  const openMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    measure();
    setOpen(true);
  };

  const closeMenu = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useLayoutEffect(() => {
    if (!open) return;
    measure();
    const onScroll = () => measure();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  if (!hasChildren) {
    return (
      <li>
        <NavLink to={`/category/${category.slug}`} className={linkClass}>
          {category.name}
        </NavLink>
      </li>
    );
  }

  return (
    <li
      ref={triggerRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={closeMenu}
    >
      <div className="flex items-stretch">
        <NavLink to={`/category/${category.slug}`} className={linkClass}>
          {category.name}
        </NavLink>
        <button
          type="button"
          aria-label={`${category.name} submenu`}
          aria-expanded={open}
          onClick={() => (open ? setOpen(false) : openMenu())}
          className="flex items-center px-1.5 text-white/80 hover:text-white hover:bg-white/5 border-b-2 border-transparent"
        >
          <ChevronDown
            size={14}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {open ? (
        <CategoryDropdownMenu
          category={category}
          items={children}
          anchorRect={anchorRect}
          onKeepOpen={openMenu}
          onClose={() => {
            if (closeTimer.current) clearTimeout(closeTimer.current);
            setOpen(false);
          }}
        />
      ) : null}
    </li>
  );
}

export default function Navbar({ categories = [], onMenuClick }) {
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef(null);

  const roots = (Array.isArray(categories) ? categories : []).filter(
    (c) => c && c.isActive !== false
  );
  const visibleCategories = roots.slice(0, 8);
  const hiddenCategories = roots.slice(8);

  useEffect(() => {
    if (!showMore) return;
    const onDoc = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setShowMore(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [showMore]);

  const linkClass = ({ isActive }) =>
    `flex items-center h-12 px-3.5 text-[13px] lg:text-sm font-semibold uppercase tracking-wide transition border-b-2 ${
      isActive
        ? "text-white border-accent"
        : "text-white/85 border-transparent hover:text-white hover:bg-white/5"
    }`;

  const homeClass = ({ isActive }) =>
    `flex items-center justify-center w-11 h-12 transition border-b-2 ${
      isActive
        ? "text-white border-accent"
        : "text-white/85 border-transparent hover:text-white hover:bg-white/5"
    }`;

  return (
    <nav className="bg-[#0a4caf]">
      <div className="max-w-site mx-auto px-2 sm:px-4">
        <div className="relative flex items-center min-h-12">
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={onMenuClick}
              className="flex items-center justify-center w-10 h-10 rounded text-white/90 hover:bg-white/10 transition"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            <div className="hidden md:block w-[220px] lg:w-[280px]">
              <SearchSuggest variant="nav" />
            </div>
          </div>

          <div className="flex-1 overflow-x-auto scrollbar-hide ml-1">
            <ul className="flex items-center whitespace-nowrap">
              <li>
                <NavLink
                  to="/"
                  end
                  className={homeClass}
                  title="Home"
                  aria-label="Home"
                >
                  <Home size={18} strokeWidth={2.2} />
                </NavLink>
              </li>
              {visibleCategories.map((category) => (
                <CategoryNavItem
                  key={category._id}
                  category={category}
                  linkClass={linkClass}
                />
              ))}
            </ul>
          </div>

          {hiddenCategories.length > 0 && (
            <div className="relative flex-shrink-0" ref={moreRef}>
              <button
                type="button"
                onClick={() => setShowMore(!showMore)}
                className="flex items-center gap-1 h-12 px-3 text-sm font-semibold uppercase tracking-wide text-white/90 hover:text-white"
              >
                More
                <ChevronDown
                  size={16}
                  className={`transition-transform ${showMore ? "rotate-180" : ""}`}
                />
              </button>

              {showMore && (
                <div className="absolute right-0 top-full mt-0 w-60 bg-white shadow-lg border border-slate-200 py-2 z-[200] max-h-[70vh] overflow-y-auto">
                  {hiddenCategories.map((category) => {
                    const kids = (category.children || []).filter(
                      (c) => c.isActive !== false
                    );
                    return (
                      <div
                        key={category._id}
                        className="border-b border-slate-50 last:border-0"
                      >
                        <NavLink
                          to={`/category/${category.slug}`}
                          onClick={() => setShowMore(false)}
                          className={({ isActive }) =>
                            `block px-4 py-2.5 text-sm font-semibold ${
                              isActive
                                ? "bg-accent-softbg text-accent"
                                : "text-ink hover:bg-slate-50"
                            }`
                          }
                        >
                          {category.name}
                        </NavLink>
                        {kids.map((sub) => (
                          <NavLink
                            key={sub._id}
                            to={`/category/${sub.slug}`}
                            onClick={() => setShowMore(false)}
                            className={({ isActive }) =>
                              `block pl-7 pr-4 py-2 text-sm ${
                                isActive
                                  ? "bg-accent-softbg text-accent font-semibold"
                                  : "text-ink-muted hover:bg-slate-50 hover:text-ink"
                              }`
                            }
                          >
                            {sub.name}
                          </NavLink>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="md:hidden pb-3 px-1">
          <SearchSuggest variant="page" />
        </div>
      </div>
    </nav>
  );
}
