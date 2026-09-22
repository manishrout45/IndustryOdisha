import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArticleForm from "../components/articles/ArticleForm";
import { PageHeader } from "../components/ui/PageUI";
import { getArticleById, updateArticle } from "../services/articleService";

function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getArticleById(id)
      .then((res) => {
        const articleData =
          res?.data?.data ||
          res?.data?.article ||
          res?.article ||
          res?.data ||
          res;
        setArticle(articleData);
      })
      .catch(() => alert("Failed to load article"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      await updateArticle(id, formData);
      navigate("/articles");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update article");
    }
  };

  if (loading) {
    return (
      <div className="cms-card p-10 text-center text-ink-muted">
        Loading article…
      </div>
    );
  }

  if (!article) {
    return (
      <div className="cms-card p-10 text-center text-red-600">
        Article not found
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Edit story"
        subtitle="Update content, status and placement flags"
        breadcrumbs={[
          { label: "Articles", to: "/articles" },
          { label: "Edit" },
        ]}
      />

      <ArticleForm
        initialData={article}
        onSubmit={handleSubmit}
        submitText="Update article"
      />
    </div>
  );
}

export default EditArticle;
