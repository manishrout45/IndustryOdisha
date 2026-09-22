import React, { useState } from "react";
import { createTag } from "../../services/tagService";

function TagForm({ onCreated }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!name.trim()) return;
    try {
      setSaving(true);
      await createTag({ name: name.trim() });
      setName("");
      onCreated?.();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to create tag");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="cms-card p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-ink">Add tag</h3>
        <p className="text-xs text-ink-muted mt-1">
          Keep tags short and searchable
        </p>
      </div>
      <div>
        <label className="cms-label">Tag name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Elections"
          className="cms-input"
        />
      </div>
      <button type="submit" disabled={saving} className="cms-btn-primary w-full">
        {saving ? "Saving…" : "Save tag"}
      </button>
    </form>
  );
}

export default TagForm;
