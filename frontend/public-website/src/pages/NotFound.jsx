import React from "react";
import MainLayout from "../layouts/MainLayout";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-7xl font-bold mb-4">
          404
        </h1>

        <p className="mb-6">
          Page not found
        </p>

        <Link
          to="/"
          className="px-5 py-3 bg-blue-600 text-white rounded-lg"
        >
          Back to Home
        </Link>
      </div>
    </MainLayout>
  );
}

export default NotFound;