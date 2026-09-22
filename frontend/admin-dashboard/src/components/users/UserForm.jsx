import React, { useState } from "react";
import { createUser } from "../../services/userService";

function UserForm({ onCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "author",
  });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) {
      alert("Email and password are required");
      return;
    }
    try {
      setSaving(true);
      await createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });
      setFormData({ name: "", email: "", password: "", role: "author" });
      onCreated?.();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submitHandler}
      className="cms-card p-5 space-y-4 relative z-20 isolate"
      autoComplete="off"
      data-lpignore="true"
      data-1p-ignore="true"
      data-bwignore="true"
      data-form-type="other"
    >
      <div>
        <h3 className="font-semibold text-ink">Create user</h3>
        <p className="text-xs text-ink-muted mt-1">
          Authors can write; admins manage the site
        </p>
      </div>

      <div>
        <label className="cms-label" htmlFor="admin-create-user-name">
          Full name
        </label>
        <input
          id="admin-create-user-name"
          name="name"
          type="text"
          className="cms-input"
          value={formData.name}
          onChange={handleChange}
          autoComplete="off"
          required
        />
      </div>

      <div className="relative z-20">
        <label className="cms-label" htmlFor="admin-create-user-email">
          Email
        </label>
        <input
          id="admin-create-user-email"
          name="email"
          type="text"
          className="cms-input"
          value={formData.email}
          onChange={handleChange}
          autoComplete="off"
          inputMode="email"
          spellCheck={false}
          required
        />
      </div>

      <div className="relative z-20">
        <label className="cms-label" htmlFor="admin-create-user-password">
          Password
        </label>
        <div className="relative">
          <input
            id="admin-create-user-password"
            name="password"
            type={showPassword ? "text" : "password"}
            className="cms-input pr-20"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            spellCheck={false}
            required
            minLength={6}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-accent px-2 py-1 z-30"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div>
        <label className="cms-label" htmlFor="admin-create-user-role">
          Role
        </label>
        <select
          id="admin-create-user-role"
          name="role"
          className="cms-input"
          value={formData.role}
          onChange={handleChange}
          autoComplete="off"
        >
          <option value="author">Author</option>
          <option value="admin">Admin</option>
          <option value="super-admin">Super Admin</option>
        </select>
      </div>

      <button type="submit" disabled={saving} className="cms-btn-primary w-full">
        {saving ? "Creating…" : "Create user"}
      </button>
    </form>
  );
}

export default UserForm;
