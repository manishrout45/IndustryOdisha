import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArticleForm from "../components/articles/ArticleForm";
import { PageHeader } from "../components/ui/PageUI";
import { createArticle } from "../services/articleService";

const CreateArticle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      await createArticle(formData);
      navigate("/articles");
    } catch (err) {
      const errorMessage =
        err.response?.data?.errors?.map((e) => e.msg).join("\n") ||
        err.response?.data?.message ||
        "Failed to create article";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Write story"
        subtitle="Compose with the formatting toolbar, then save as draft or submit"
        breadcrumbs={[
          { label: "Articles", to: "/articles" },
          { label: "Create" },
        ]}
      />

      <ArticleForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default CreateArticle;
