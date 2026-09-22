import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import ArticleForm from "../components/articles/ArticleForm";

import {
  getArticleById,
  updateArticle,
} from "../services/articleService";

function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, []);

  const fetchArticle = async () => {
    try {
      const res = await getArticleById(id);

      const articleData =
        res.article ||
        res.data?.article ||
        res.data;

      setArticle(articleData);
    } catch (error) {
      console.error(error);
      alert("Failed to load article");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    try {
      await updateArticle(id, data);

      alert("Article updated successfully");

      navigate("/articles");
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Failed to update article"
      );
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-16 text-center text-slate-500">
          Loading article…
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Edit Article
        </h1>
        <p className="text-slate-500 mt-1">
          Update content, SEO, and homepage placement flags.
        </p>
      </div>

      <ArticleForm
        onSubmit={handleSubmit}
        initialData={article || {}}
        submitText="Update Article"
      />
    </DashboardLayout>
  );
}

export default EditArticle;