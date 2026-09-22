import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Tags,
  Users,
  PenLine,
  LayoutTemplate,
  Image,
  Megaphone,
  BarChart3,
  Search,
  Settings,
  MessagesSquare,
  Mail,
  Video,
  X,
} from "lucide-react";

const menus = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Articles", path: "/articles", icon: FileText },
  { name: "Categories", path: "/categories", icon: FolderOpen },
  { name: "Tags", path: "/tags", icon: Tags },
  { name: "Users", path: "/users", icon: Users },
  { name: "Authors", path: "/authors", icon: PenLine },
  { name: "Comments", path: "/comments", icon: MessagesSquare },
  { name: "Homepage", path: "/homepage-builder", icon: LayoutTemplate },
  { name: "Videos", path: "/videos", icon: Video },
  { name: "Media", path: "/media-library", icon: Image },
  { name: "Ads", path: "/advertisements", icon: Megaphone },
  { name: "Newsletter", path: "/newsletter", icon: Mail },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
  { name: "SEO", path: "/seo", icon: Search },
  { name: "Settings", path: "/settings", icon: Settings },
];

function Sidebar({ open, onClose }) {
  const location = useLocation();

  useEffect(() => {
    onClose?.();
  }, [location.pathname]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink/40 lg:hidden transition ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-ink text-white flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
              Newsroom
            </p>
            <h2 className="font-display text-xl font-bold leading-tight">
              Industry Odisha
            </h2>
            <p className="text-xs text-white/55 mt-0.5">Admin Console</p>
          </div>
          <button
            type="button"
            className="lg:hidden p-1.5 rounded hover:bg-white/10"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menus.map((menu) => {
            const Icon = menu.icon;
            return (
              <NavLink
                key={menu.path}
                to={menu.path}
                end={menu.path === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-accent text-white shadow-sm"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={18} className="shrink-0 opacity-90" />
                {menu.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 text-xs text-white/45">
          Editorial control panel
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
