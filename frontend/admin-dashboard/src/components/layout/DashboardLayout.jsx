import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-surface">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        <footer className="px-6 py-4 text-center text-xs text-ink-muted border-t border-slate-200/80">
          © {new Date().getFullYear()} Industry Odisha · Admin Console
        </footer>
      </div>
    </div>
  );
}

export default DashboardLayout;
