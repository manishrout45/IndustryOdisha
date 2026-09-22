import React, { useEffect, useState } from "react";
import { getTags, deleteTag } from "../../services/tagService";
import { EmptyState } from "../ui/PageUI";

function TagTable({ refresh }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTags();
  }, [refresh]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await getTags();
      const list = response?.data || response || [];
      setTags(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error(error);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this tag?")) return;
    try {
      await deleteTag(id);
      setTags((prev) => prev.filter((t) => t._id !== id));
    } catch (error) {
      alert(error?.response?.data?.message || "Delete failed");
    }
  };

  if (loading) {
    return <div className="cms-card p-8 text-center text-ink-muted">Loading tags…</div>;
  }

  if (!tags.length) {
    return (
      <EmptyState
        title="No tags yet"
        description="Create tags to organize articles across sections."
      />
    );
  }

  return (
    <div className="cms-table-wrap">
      <table className="cms-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tags.map((tag) => (
            <tr key={tag._id}>
              <td className="font-medium">{tag.name}</td>
              <td className="text-ink-muted">{tag.slug || "—"}</td>
              <td>
                <button
                  type="button"
                  onClick={() => handleDelete(tag._id)}
                  className="cms-btn-danger text-xs py-1.5"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TagTable;
