import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";

function CategoryEditPanel({
  category,
  onClose,
  onUpdate,
  onAddSub,
  onUpdateSub,
  onDeleteSub,
  onReorderSubs,
}) {
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [isActive, setIsActive] = useState(category?.isActive !== false);
  const [saving, setSaving] = useState(false);
  const [subName, setSubName] = useState("");
  const [editingSubId, setEditingSubId] = useState(null);
  const [editingSubName, setEditingSubName] = useState("");
  const [dragSubId, setDragSubId] = useState(null);

  useEffect(() => {
    setName(category?.name || "");
    setDescription(category?.description || "");
    setIsActive(category?.isActive !== false);
    setSubName("");
    setEditingSubId(null);
  }, [category]);

  if (!category) return null;

  const children = Array.isArray(category.children) ? category.children : [];

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setSaving(true);
      await onUpdate(category._id, {
        name: name.trim(),
        description: description.trim(),
        isActive,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSub = async (e) => {
    e.preventDefault();
    if (!subName.trim()) return;
    await onAddSub({
      name: subName.trim(),
      parent: category._id,
    });
    setSubName("");
  };

  const handleSubDragStart = (id) => setDragSubId(id);

  const handleSubDrop = async (targetId) => {
    if (!dragSubId || dragSubId === targetId) {
      setDragSubId(null);
      return;
    }
    const ids = children.map((c) => c._id);
    const from = ids.indexOf(dragSubId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) {
      setDragSubId(null);
      return;
    }
    const next = [...ids];
    next.splice(from, 1);
    next.splice(to, 0, dragSubId);
    setDragSubId(null);
    await onReorderSubs(category._id, next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 p-5 space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-ink text-lg">Edit category</h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Update details and manage subcategories for the header dropdown
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-ink-muted"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="cms-label">Name</label>
            <input
              className="cms-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="cms-label">Description</label>
            <textarea
              className="cms-input min-h-[70px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active on public site
          </label>
          <button type="submit" disabled={saving} className="cms-btn-primary">
            {saving ? "Saving…" : "Update category"}
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-ink text-sm">Subcategories</h4>
            <span className="text-xs text-ink-muted">{children.length}</span>
          </div>

          <form onSubmit={handleAddSub} className="flex gap-2">
            <input
              className="cms-input flex-1"
              placeholder="New subcategory name"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
            />
            <button type="submit" className="cms-btn-accent shrink-0">
              <Plus size={16} />
              Add
            </button>
          </form>

          {children.length === 0 ? (
            <p className="text-xs text-ink-muted py-2">
              No subcategories yet. They appear as a dropdown under this category
              in the public header.
            </p>
          ) : (
            <ul className="space-y-2">
              {children.map((sub) => (
                <li
                  key={sub._id}
                  draggable
                  onDragStart={() => handleSubDragStart(sub._id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleSubDrop(sub._id)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 ${
                    dragSubId === sub._id ? "opacity-50" : ""
                  }`}
                >
                  <span className="cursor-grab text-ink-muted text-xs select-none px-1">
                    ⋮⋮
                  </span>
                  {editingSubId === sub._id ? (
                    <>
                      <input
                        className="cms-input flex-1 py-1.5"
                        value={editingSubName}
                        onChange={(e) => setEditingSubName(e.target.value)}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="cms-btn-primary text-xs py-1.5"
                        onClick={async () => {
                          if (!editingSubName.trim()) return;
                          await onUpdateSub(sub._id, {
                            name: editingSubName.trim(),
                          });
                          setEditingSubId(null);
                        }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="cms-btn-ghost text-xs py-1.5"
                        onClick={() => setEditingSubId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm font-medium text-ink truncate">
                        {sub.name}
                      </span>
                      <button
                        type="button"
                        className="cms-btn-ghost text-xs py-1.5 inline-flex items-center gap-1"
                        onClick={() => {
                          setEditingSubId(sub._id);
                          setEditingSubName(sub.name);
                        }}
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="cms-btn-danger text-xs py-1.5 inline-flex items-center gap-1"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete subcategory “${sub.name}”?`
                            )
                          ) {
                            onDeleteSub(sub._id);
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryEditPanel;
