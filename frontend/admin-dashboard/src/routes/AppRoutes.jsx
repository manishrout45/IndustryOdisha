import React from "react";
import { Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import AuthCallback from "../pages/AuthCallback";
import NotFound from "../pages/NotFound";

import Users from "../pages/Users";
import Authors from "../pages/Authors";
import AuthorPosts from "../pages/AuthorPosts";

import Articles from "../pages/Articles";
import CreateArticle from "../pages/CreateArticle";
import EditArticle from "../pages/EditArticle";

import HomepageBuilder from "../pages/HomepageBuilder";

import Categories from "../pages/Categories";
import Tags from "../pages/Tags";

import MediaLibrary from "../pages/MediaLibrary";

import Advertisements from "../pages/Advertisements";
import Videos from "../pages/Videos";
import Subscribers from "../pages/Subscribers";

import Analytics from "../pages/Analytics";

import SeoSettings from "../pages/SeoSettings";

import Settings from "../pages/Settings";

import Comments from "../pages/Comments";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Articles */}
      <Route
        path="/articles"
        element={
          <ProtectedRoute>
            <Articles />
          </ProtectedRoute>
        }
      />

      <Route
        path="/articles/create"
        element={
          <ProtectedRoute>
            <CreateArticle />
          </ProtectedRoute>
        }
      />

      <Route
        path="/articles/edit/:id"
        element={
          <ProtectedRoute>
            <EditArticle />
          </ProtectedRoute>
        }
      />

      {/* Users */}
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        }
      />

      {/* Authors */}
      <Route
        path="/authors"
        element={
          <ProtectedRoute>
            <Authors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/authors/:id/posts"
        element={
          <ProtectedRoute>
            <AuthorPosts />
          </ProtectedRoute>
        }
      />

      {/* Homepage Builder */}
      <Route
        path="/homepage-builder"
        element={
          <ProtectedRoute>
            <HomepageBuilder />
          </ProtectedRoute>
        }
      />

      {/* Categories */}
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        }
      />

      {/* Tags */}
      <Route
        path="/tags"
        element={
          <ProtectedRoute>
            <Tags />
          </ProtectedRoute>
        }
      />

      {/* Media Library */}
      <Route
        path="/media-library"
        element={
          <ProtectedRoute>
            <MediaLibrary />
          </ProtectedRoute>
        }
      />

      {/* Advertisements */}
      <Route
        path="/advertisements"
        element={
          <ProtectedRoute>
            <Advertisements />
          </ProtectedRoute>
        }
      />

      {/* Homepage Videos */}
      <Route
        path="/videos"
        element={
          <ProtectedRoute>
            <Videos />
          </ProtectedRoute>
        }
      />

      {/* Newsletter */}
      <Route
        path="/newsletter"
        element={
          <ProtectedRoute>
            <Subscribers />
          </ProtectedRoute>
        }
      />

      {/* Comments */}
      <Route
        path="/comments"
        element={
          <ProtectedRoute>
            <Comments />
          </ProtectedRoute>
        }
      />

      {/* Analytics */}
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />

      {/* SEO */}
      <Route
        path="/seo"
        element={
          <ProtectedRoute>
            <SeoSettings />
          </ProtectedRoute>
        }
      />

      {/* Settings */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Login */}
      <Route path="/login" element={<Login />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* 404 */}
      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}

export default AppRoutes;