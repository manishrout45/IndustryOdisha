import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-6xl font-bold mb-4">
        404
      </h1>

      <p className="text-lg mb-4">
        Page Not Found
      </p>

      <Link
        to="/"
        className="bg-blue-600 text-white px-5 py-3 rounded-lg"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;