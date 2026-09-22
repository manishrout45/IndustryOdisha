import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { PageHeader, EmptyState } from "../components/ui/PageUI";
import { getAuthors } from "../services/authorService";

function Authors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuthors()
      .then((data) => setAuthors(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error(err);
        setAuthors([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <PageHeader
        title="Authors"
        subtitle="People who can write and publish for the newsroom"
      />

      {loading ? (
        <div className="cms-card p-10 text-center text-ink-muted">
          Loading authors…
        </div>
      ) : authors.length === 0 ? (
        <EmptyState
          title="No authors found"
          description="Create users with the author role from Users."
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {authors.map((author) => {
            const posts = Number(author.postCount ?? author.articleCount ?? 0);
            return (
              <div key={`${author.source || "user"}-${author._id}`} className="cms-card p-5">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-ink text-white flex items-center justify-center font-bold">
                    {(author.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink truncate">
                      {author.name}
                    </h3>
                    <p className="text-xs text-ink-muted truncate">
                      {author.email}
                    </p>
                    {author.source === "wordpress-mysql" ? (
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wide text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        WordPress
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="capitalize text-ink-muted">{author.role}</span>
                  <Link
                    to={`/authors/${author._id}/posts`}
                    className="font-semibold text-accent hover:text-ink underline-offset-2 hover:underline"
                    title={`View posts by ${author.name}`}
                  >
                    {posts} {posts === 1 ? "post" : "posts"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}

export default Authors;
