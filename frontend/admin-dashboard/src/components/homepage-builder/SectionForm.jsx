import React, { useState } from "react";
import SectionFields from "./SectionFields";

const emptyForm = () => ({
  title: "",
  type: "latest",
  isActive: true,
  config: {
    limit: 6,
    showTitle: true,
    customHtml: "",
    categoryId: null,
  },
});

function SectionForm({ onAdd, loading = false }) {
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("Please enter a section title.");
      return;
    }

    await onAdd({
      title: form.title.trim(),
      type: form.type,
      isActive: form.isActive !== false,
      config: {
        limit: Number(form.config?.limit) || 6,
        showTitle: form.config?.showTitle !== false,
        customHtml: form.config?.customHtml || "",
        categoryId: form.config?.categoryId || null,
      },
    });

    setForm(emptyForm());
  };

  return (
    <form onSubmit={handleSubmit} className="cms-card p-5 space-y-4">
      <div>
        <h2 className="font-semibold text-ink">Add homepage section</h2>
        <p className="text-xs text-ink-muted mt-1">
          Extra blocks beyond the defaults (optional)
        </p>
      </div>

      <SectionFields value={form} onChange={setForm} loading={loading} />

      <button type="submit" disabled={loading} className="cms-btn-primary w-full">
        {loading ? "Adding…" : "Add section"}
      </button>
    </form>
  );
}

export default SectionForm;
