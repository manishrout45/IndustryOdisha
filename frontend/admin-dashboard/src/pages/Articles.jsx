import React from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import ArticleTable from "../components/articles/ArticleTable";
import { PageHeader } from "../components/ui/PageUI";

function Articles() {
  return (
    <DashboardLayout>
      <PageHeader
        title="Articles"
        subtitle="Create, review, and publish news stories"
        action={
          <Link to="/articles/create" className="cms-btn-accent">
            <Plus size={16} />
            Create article
          </Link>
        }
      />
      <ArticleTable />
    </DashboardLayout>
  );
}

export default Articles;
