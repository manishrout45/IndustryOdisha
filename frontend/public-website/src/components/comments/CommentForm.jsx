import { useState } from "react";

function CommentForm() {
  const [comment, setComment] =
    useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(comment);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 mt-8"
    >
      <textarea
        rows="4"
        value={comment}
        onChange={(e) =>
          setComment(e.target.value)
        }
        className="w-full border p-3 rounded"
      />

      <button
        className="bg-red-600 text-white px-5 py-2 rounded"
      >
        Post Comment
      </button>
    </form>
  );
}

export default CommentForm;