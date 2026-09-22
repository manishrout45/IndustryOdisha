import React from "react";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import AdSlot from "../components/ads/AdSlot";

function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <AdSlot
        position="header-top"
        size="leaderboard"
        className="bg-slate-50 border-b border-slate-100 max-w-site mx-auto px-4 w-full"
      />

      <Header />

      <main className="flex-grow">{children}</main>

      <AdSlot
        position="footer"
        size="banner"
        className="max-w-site mx-auto px-4 w-full my-4"
      />

      <Footer />
    </div>
  );
}

export default MainLayout;
