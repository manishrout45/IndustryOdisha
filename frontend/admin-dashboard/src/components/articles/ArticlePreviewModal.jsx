import React from "react";

function ArticlePreviewModal({
  article,
  onClose,
}) {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-start overflow-y-auto p-6">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-xl relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl font-bold"
        >
          ✕
        </button>

        {/* Featured Image */}
        {article.featuredImage && (
          <img
            src={article.featuredImage}
            alt={article.title}
            className="w-full h-[400px] object-cover rounded-t-xl"
          />
        )}

        <div className="p-8">

          <div className="mb-4">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              {article.category?.name}
            </span>
          </div>

          <h1 className="text-5xl font-bold mb-4">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-gray-500 mb-8">
            <span>
              By {article.author?.name}
            </span>

            <span>
              {new Date(
                article.createdAt
              ).toLocaleDateString()}
            </span>

            <span>
              👁 {article.viewCount}
            </span>
          </div>

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{
              __html: article.content,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ArticlePreviewModal;