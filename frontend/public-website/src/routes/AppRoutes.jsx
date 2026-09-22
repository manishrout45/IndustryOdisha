import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Search from "../pages/Search";
import Article from "../pages/Article";
import Category from "../pages/Category";
import Tag from "../pages/Tag";
import Author from "../pages/Author";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Search */}
      <Route path="/search" element={<Search />} />

      {/* News */}
      <Route path="/article/:slug" element={<Article />} />
      <Route path="/category/:slug" element={<Category />} />
      <Route path="/tag/:slug" element={<Tag />} />

      {/* Author */}
      <Route path="/author/:id" element={<Author />} />

      {/* Legal */}
      <Route
        path="/privacy-policy"
        element={<PrivacyPolicy />}
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;