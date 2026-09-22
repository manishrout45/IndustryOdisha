import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import ArticleForm from "../components/articles/ArticleForm";
import { createArticle } from "../services/articleService";

function CreateArticle() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    try {
      console.log("Submitting:", data);

      const response = await createArticle(data);

      console.log("Created:", response);

      alert("Article created successfully!");

      // Redirect to Articles page
      navigate("/articles");
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
        "Failed to create article"
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Create Article
        </h1>
        <p className="text-slate-500 mt-1">
          Write with the formatting toolbar, set category & flags, then publish.
        </p>
      </div>

      <ArticleForm
        onSubmit={handleSubmit}
        submitText="Publish / Save Article"
      />
    </DashboardLayout>
  );
}

export default CreateArticle;