import React, { useState } from "react";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { EmptyState } from "../ui/PageUI";

function CategoryTable({ categories, onDelete, onEdit, onReorder }) {
  const [dragId, setDragId] = useState(null);

  if (!categories?.length) {
    return (
      <EmptyState
        title="No categories yet"
        description="Add Politics, Sports, Business and more for the site nav."
      />
    );
  }

  const handleDragStart = (id) => setDragId(id);

  const handleDrop = (targetId) => {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }
    const ids = categories.map((c) => c._id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) {
      setDragId(null);
      return;
    }
    const next = [...ids];
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    setDragId(null);
    onReorder?.(next);
  };

  return (
    <div className="cms-card overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <p className="text-sm font-medium text-ink">
          Drag to reorder · order shows on the public header
        </p>
        <span className="text-xs text-ink-muted">{categories.length} categories</span>
      </div>
      <ul className="divide-y divide-slate-100">
        {categories.map((category) => {
          const childCount = category.children?.length || 0;
          return (
            <li
              key={category._id}
              draggable
              onDragStart={() => handleDragStart(category._id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(category._id)}
              className={`flex items-center gap-3 px-4 py-3 bg-white hover:bg-slate-50/80 transition ${
                dragId === category._id ? "opacity-50 bg-slate-50" : ""
              }`}
            >
              <button
                type="button"
                className="cursor-grab active:cursor-grabbing text-ink-muted p-1"
                aria-label="Drag to reorder"
                title="Drag to reorder"
              >
                <GripVertical size={18} />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-ink truncate">
                    {category.name}
                  </p>
                  {category.isActive === false ? (
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      Off
                    </span>
                  ) : null}
                  {childCount > 0 ? (
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-sky-50 text-sky-700">
                      {childCount} sub
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-ink-muted truncate mt-0.5">
                  /{category.slug}
                  {childCount
                    ? ` · ${category.children.map((c) => c.name).join(", ")}`
                    : ""}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onEdit?.(category)}
                  className="cms-btn-ghost text-xs py-1.5 inline-flex items-center gap-1"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(category._id)}
                  className="cms-btn-danger text-xs py-1.5 inline-flex items-center gap-1"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default CategoryTable;
