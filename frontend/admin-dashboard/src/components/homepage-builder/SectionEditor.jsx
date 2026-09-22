import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import SectionFields, { sectionTypeLabel } from "./SectionFields";

function SectionEditor({ section, open, onClose, onSave, loading = false }) {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!section || !open) {
      setForm(null);
      return;
    }
    setForm({
      title: section.title || "",
      type: section.type || "latest",
      isActive: section.isActive !== false,
      config: {
        limit: section.config?.limit ?? 6,
        showTitle: section.config?.showTitle !== false,
        customHtml: section.config?.customHtml || "",
        categoryId: section.config?.categoryId
          ? String(section.config.categoryId)
          : null,
      },
    });
  }, [section, open]);

  if (!open || !form) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("Please enter a section title.");
      return;
    }
    await onSave({
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
        className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">Edit section</h2>
            <p className="text-xs text-ink-muted mt-1">
              {sectionTypeLabel(form.type)}
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

        <SectionFields
          value={form}
          onChange={setForm}
          loading={loading}
          allowTypeChange={false}
        />

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="cms-btn-ghost flex-1"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cms-btn-primary flex-1"
            disabled={loading}
          >
            {loading ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SectionEditor;
