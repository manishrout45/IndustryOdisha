import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, Menu, Plus } from "lucide-react";
import { logout } from "../../store/slices/authSlice";

const Header = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("authorUser") || "null");
    } catch {
      return null;
    }
  })();

  const displayUser = user || storedUser;

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("authorToken");
    localStorage.removeItem("authorUser");
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
              Author Workspace
            </p>
            <p className="text-xs text-ink-muted truncate hidden sm:block">
              Your stories and drafts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/articles/create"
            className="cms-btn-accent hidden sm:inline-flex"
          >
            <Plus size={16} />
            Write
          </Link>

          <div className="hidden md:flex flex-col items-end leading-tight mr-1">
            <span className="text-sm font-semibold text-ink">
              {displayUser?.name || "Author"}
            </span>
            <span className="text-[11px] text-ink-muted">Journalist</span>
          </div>

          <button type="button" onClick={handleLogout} className="cms-btn-danger">
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
