import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { PageHeader, EmptyState, StatusBadge } from "../components/ui/PageUI";
import { getAuthorById, getAuthorPosts } from "../services/authorService";
import { getImageUrl, formatShortDate } from "../utils/media";

function AuthorPosts() {
  const { id } = useParams();
  const [author, setAuthor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const [authorData, postsData] = await Promise.all([
          getAuthorById(id),
          getAuthorPosts(id, { limit: 2000 }),
        ]);
        if (cancelled) return;
        setAuthor(authorData);
        setPosts(postsData.articles || []);
        setTotal(postsData.total ?? postsData.articles?.length ?? 0);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setAuthor(null);
          setPosts([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const name = author?.name || "Author";

  return (
    <DashboardLayout>
      <div className="mb-4">
        <Link
          to="/authors"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink"
        >
          <ArrowLeft size={16} />
          Back to authors
        </Link>
      </div>

      <PageHeader
        title={loading ? "Author posts" : `Posts by ${name}`}
        subtitle={
          loading
            ? "Loading…"
            : `${total} ${total === 1 ? "post" : "posts"} · ${author?.email || ""}`
        }
      />

      {loading ? (
        <div className="cms-card p-10 text-center text-ink-muted">
          Loading posts…
        </div>
      ) : !author ? (
        <EmptyState
          title="Author not found"
          description="This author may have been removed."
        />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description={`${name} has not published or drafted any posts.`}
        />
      ) : (
        <div className="cms-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Post</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Views</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={getImageUrl(
                            post.featuredImage,
                            "https://placehold.co/80x56?text=Post"
                          )}
                          alt=""
                          className="w-16 h-11 object-cover bg-slate-100 shrink-0 rounded"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-ink line-clamp-2">
                            {post.title}
                          </p>
                          {post.excerpt ? (
                            <p className="text-xs text-ink-muted line-clamp-1 mt-0.5">
                              {post.excerpt}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-muted whitespace-nowrap">
                      {post.category?.name || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-4 py-3 tabular-nums text-ink-muted">
                      {Number(post.viewCount || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-ink-muted whitespace-nowrap">
                      {formatShortDate(post.publishedAt || post.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/articles/edit/${post._id}`}
                        className="cms-btn-ghost text-xs py-1.5"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default AuthorPosts;
