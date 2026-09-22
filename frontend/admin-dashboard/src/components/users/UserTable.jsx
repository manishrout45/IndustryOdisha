import React, { useEffect, useState } from "react";
import { getUsers, deleteUser } from "../../services/userService";
import { EmptyState } from "../ui/PageUI";
import UserEditModal from "./UserEditModal";

function isWpUser(user) {
  return (
    user?.source === "wordpress-mysql" ||
    String(user?._id || "").startsWith("wp-")
  );
}

function sourceLabel(user) {
  if (
    user?.linkedSources?.includes("wordpress-mysql") ||
    user?.source === "mongodb+wordpress"
  ) {
    return "Mongo + WordPress";
  }
  if (isWpUser(user)) return "WordPress";
  return "MongoDB";
}

function UserTable({ refresh }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [refresh]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user) => {
    const id = user._id;
    const label = user.name || user.email || id;
    const wp = isWpUser(user);
    const msg = wp
      ? `Remove WordPress user "${label}"? Their posts will be reassigned to the primary admin.`
      : `Remove user "${label}"?`;
    if (!window.confirm(msg)) return;

    try {
      setBusyId(id);
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const handleSaved = (updated) => {
    setUsers((prev) =>
      prev.map((u) =>
        String(u._id) === String(updated._id || editing?._id)
          ? { ...u, ...updated }
          : u
      )
    );
  };

  if (loading) {
    return (
      <div className="cms-card p-8 text-center text-ink-muted">
        Loading users…
      </div>
    );
  }

  if (!users.length) {
    return (
      <EmptyState
        title="No users found"
        description="Create an author or admin to get started."
      />
    );
  }

  return (
    <>
      <div className="cms-table-wrap overflow-x-auto">
        <table className="cms-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Source</th>
              <th>Posts</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const posts = Number(user.postCount ?? user.articleCount ?? 0);
              const busy = busyId === user._id;
              return (
                <tr key={user._id}>
                  <td className="font-medium">{user.name}</td>
                  <td className="text-ink-muted">{user.email || "—"}</td>
                  <td>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        sourceLabel(user).includes("WordPress")
                          ? "bg-blue-50 text-blue-700"
                          : "bg-violet-50 text-violet-700"
                      }`}
                    >
                      {sourceLabel(user)}
                    </span>
                  </td>
                  <td className="text-ink-muted">{posts}</td>
                  <td className="capitalize text-sm text-ink-muted">
                    {user.role}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(user)}
                        disabled={busy}
                        className="cms-btn-primary text-xs py-1.5"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        disabled={busy}
                        className="cms-btn-danger text-xs py-1.5"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <UserEditModal
        user={editing}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        onSaved={handleSaved}
      />
    </>
  );
}

export default UserTable;
