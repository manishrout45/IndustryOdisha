import React, { useEffect, useState } from "react";
import CommentList from "../components/comments/CommentList";
import { PageHeader } from "../components/ui/PageUI";
import { getComments } from "../services/commentService";

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComments()
      .then((response) => {
        const data = response?.data || response;
        const list =
          data?.comments ||
          data?.data?.comments ||
          data?.data ||
          data ||
          [];
        setComments(Array.isArray(list) ? list : []);
      })
      .catch((error) => {
        console.error(error);
        setComments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Comments"
        subtitle="Reader feedback on your published stories"
      />

      {loading ? (
        <div className="cms-card p-10 text-center text-ink-muted">
          Loading comments…
        </div>
      ) : (
        <CommentList comments={comments} />
      )}
    </div>
  );
};

export default Comments;
