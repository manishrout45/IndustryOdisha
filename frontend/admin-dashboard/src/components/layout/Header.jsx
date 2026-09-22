import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, Menu, Plus, Bell } from "lucide-react";

function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminToken");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="flex items-center justify-between gap-3 px-4 md:px-6 h-16">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink truncate">
              Newsroom Admin
            </p>
            <p className="text-xs text-ink-muted truncate hidden sm:block">
              Manage stories, sections & publishing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/articles/create"
            className="cms-btn-accent hidden sm:inline-flex"
          >
            <Plus size={16} />
            New article
          </Link>

          <button
            type="button"
            className="p-2 rounded-lg hover:bg-slate-100 text-ink-muted"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>

          <div className="hidden md:flex flex-col items-end leading-tight mr-1">
            <span className="text-sm font-semibold text-ink">
              {user?.name || "Admin"}
            </span>
            <span className="text-[11px] text-ink-muted capitalize">
              {user?.role || "admin"}
            </span>
          </div>

          <button
            type="button"
            onClick={logout}
            className="cms-btn-danger"
            title="Logout"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
