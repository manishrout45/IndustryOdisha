import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { updateUser } from "../../services/userService";

function UserEditModal({ user, open, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "author",
  });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!user || !open) return;
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "author",
    });
    setShowPassword(false);
  }, [user, open]);

  if (!open || !user) return null;

  const isWp =
    user.source === "wordpress-mysql" ||
    String(user._id || "").startsWith("wp-");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Name is required");
      return;
    }
    if (!form.email.trim()) {
      alert("Email is required");
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
    };
    if (form.password.trim()) {
      if (form.password.trim().length < 6) {
        alert("Password must be at least 6 characters");
        return;
      }
      payload.password = form.password.trim();
    }

    try {
      setSaving(true);
      const updated = await updateUser(user._id, payload);
      onSaved?.(updated || { ...user, ...payload });
      onClose?.();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        aria-label="Close"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 z-10"
        autoComplete="off"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Edit user</h2>
            <p className="text-xs text-ink-muted mt-1">
              {isWp ? "WordPress / MySQL account" : "MongoDB login account"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-ink-muted"
          >
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="cms-label" htmlFor="edit-user-name">
            Full name
          </label>
          <input
            id="edit-user-name"
            className="cms-input"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            required
            autoComplete="off"
          />
        </div>

        <div>
          <label className="cms-label" htmlFor="edit-user-email">
            Email
          </label>
          <input
            id="edit-user-email"
            type="text"
            className="cms-input"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            required
            autoComplete="off"
            inputMode="email"
          />
        </div>

        <div>
          <label className="cms-label" htmlFor="edit-user-password">
            New password
          </label>
          <div className="relative">
            <input
              id="edit-user-password"
              type={showPassword ? "text" : "password"}
              className="cms-input pr-20"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              placeholder="Leave blank to keep current"
              autoComplete="new-password"
              minLength={form.password ? 6 : undefined}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-accent px-2 py-1"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div>
          <label className="cms-label" htmlFor="edit-user-role">
            Role
          </label>
          <select
            id="edit-user-role"
            className="cms-input"
            value={form.role}
            onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
          >
            <option value="author">Author</option>
            <option value="admin">Admin</option>
            <option value="super-admin">Super Admin</option>
          </select>
          {isWp ? (
            <p className="text-xs text-ink-muted mt-1">
              Admin maps to WordPress administrator; Author maps to author.
            </p>
          ) : null}
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="cms-btn-ghost flex-1"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cms-btn-primary flex-1"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserEditModal;
