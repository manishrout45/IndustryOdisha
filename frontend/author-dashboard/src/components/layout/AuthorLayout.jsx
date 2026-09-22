import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const AuthorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-surface">
      {sidebarOpen ? (
        <div
          className="fixed inset-0 bg-ink/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
        <footer className="px-6 py-4 text-center text-xs text-ink-muted border-t border-slate-200/80">
          © {new Date().getFullYear()} Industry Odisha · Author Desk
        </footer>
      </div>
    </div>
  );
};

export default AuthorLayout;
