import React from "react";
import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import AuthCallback from "../pages/AuthCallback";
import NotFound from "../pages/NotFound";

import MyArticles from "../pages/MyArticles";
import CreateArticle from "../pages/CreateArticle";
import EditArticle from "../pages/EditArticle";
import Drafts from "../pages/Drafts";
import Pending from "../pages/Pending";

import MediaLibrary from "../pages/MediaLibrary";
import Comments from "../pages/Comments";

import Analytics from "../pages/Analytics";
import Profile from "../pages/Profile";

import ProtectedRoute from "./ProtectedRoute";
import AuthorLayout from "../components/layout/AuthorLayout";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AuthorLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<Dashboard />} />

        {/* Articles */}
        <Route path="articles" element={<MyArticles />} />
        <Route path="articles/create" element={<CreateArticle />} />
        <Route path="articles/edit/:id" element={<EditArticle />} />

        {/* Drafts */}
        <Route path="drafts" element={<Drafts />} />
        <Route path="pending" element={<Pending />} />

        {/* Media */}
        <Route path="media" element={<MediaLibrary />} />

        {/* Comments */}
        <Route path="comments" element={<Comments />} />

        {/* Analytics */}
        <Route path="analytics" element={<Analytics />} />

        {/* Profile */}
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;