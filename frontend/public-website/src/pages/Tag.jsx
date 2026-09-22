import React from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

function Tag() {
  const { slug } = useParams();

  return (
    <MainLayout>
      <div className="max-w-site mx-auto px-4 py-8 md:py-12">
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-ink capitalize">
          Tag: {slug}
        </h1>
      </div>
    </MainLayout>
  );
}

export default Tag;
