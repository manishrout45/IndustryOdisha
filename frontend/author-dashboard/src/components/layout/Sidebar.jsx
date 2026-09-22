import React, { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  FileEdit,
  Clock3,
  Image,
  MessagesSquare,
  BarChart3,
  UserRound,
  X,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", path: "/", icon: LayoutDashboard },
  { title: "My Articles", path: "/articles", icon: FileText },
  { title: "Write Story", path: "/articles/create", icon: PlusCircle },
  { title: "Drafts", path: "/drafts", icon: FileEdit },
  { title: "Pending", path: "/pending", icon: Clock3 },
  { title: "Media", path: "/media", icon: Image },
  { title: "Comments", path: "/comments", icon: MessagesSquare },
  { title: "Analytics", path: "/analytics", icon: BarChart3 },
  { title: "Profile", path: "/profile", icon: UserRound },
];

const Sidebar = ({ onClose }) => {
  const location = useLocation();

  useEffect(() => {
    onClose?.();
  }, [location.pathname]);

  return (
    <aside className="w-64 h-screen bg-ink text-white flex flex-col">
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">
            Newsroom
          </p>
          <h2 className="font-display text-xl font-bold">Author Desk</h2>
          <p className="text-xs text-white/55 mt-0.5">Industry Odisha</p>
        </div>
        <button
          type="button"
          className="lg:hidden p-1.5 rounded hover:bg-white/10"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-accent text-white"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {item.title}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 text-xs text-white/45">
        Write · Edit · Publish
      </div>
    </aside>
  );
};

export default Sidebar;
