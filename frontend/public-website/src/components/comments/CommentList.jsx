function CommentList({
  comments = [],
}) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment._id}
          className="border rounded p-4"
        >
          <h4 className="font-semibold">
            {comment.name}
          </h4>

          <p>{comment.comment}</p>
        </div>
      ))}
    </div>
  );
}

export default CommentList;