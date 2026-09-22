import React, { useState } from "react";

function CategoryForm({ onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setSaving(true);
      await onCreate({
        name: name.trim(),
        description: description.trim(),
        parent: null,
      });
      setName("");
      setDescription("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="cms-card p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-ink">Add category</h3>
        <p className="text-xs text-ink-muted mt-1">
          Top-level sections in the public site header. Drag the list to reorder.
        </p>
      </div>
      <div>
        <label className="cms-label">Name</label>
        <input
          type="text"
          placeholder="e.g. Politics"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="cms-input"
          required
        />
      </div>
      <div>
        <label className="cms-label">Description (optional)</label>
        <textarea
          className="cms-input min-h-[72px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short note for editors"
        />
      </div>
      <button type="submit" disabled={saving} className="cms-btn-primary w-full">
        {saving ? "Saving…" : "Save category"}
      </button>
    </form>
  );
}

export default CategoryForm;
