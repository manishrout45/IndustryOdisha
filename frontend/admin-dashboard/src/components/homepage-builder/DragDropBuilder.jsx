import React, { useState } from "react";
import { GripVertical, LayoutGrid } from "lucide-react";

function DragDropBuilder({ sections = [], onReorder, saving = false }) {
  const [dragId, setDragId] = useState(null);

  const sorted = [...sections].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );

  const handleDragStart = (id) => setDragId(id);

  const handleDrop = (targetId) => {
    if (!dragId || dragId === targetId || saving) {
      setDragId(null);
      return;
    }

    const ids = sorted.map((s) => s._id || s.id);
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
    <div className="cms-card p-5 md:p-6">
      <div className="flex items-center justify-between mb-5 gap-3">
        <div>
          <h2 className="text-lg font-bold text-ink">Homepage order</h2>
          <p className="text-xs text-ink-muted mt-1">
            Drag sections to change the order on the public homepage. Saves
            automatically.
          </p>
        </div>
        <span className="text-sm text-ink-muted shrink-0">
          {saving ? "Saving…" : `${sorted.length} sections`}
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-10 text-ink-muted text-sm">
          No homepage sections found. Add one above first.
        </div>
      ) : (
        <ul className="space-y-2">
          {sorted.map((section, index) => {
            const id = section._id || section.id;
            return (
              <li
                key={id}
                draggable={!saving}
                onDragStart={() => handleDragStart(id)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(id)}
                className={`flex items-center justify-between border border-slate-200 rounded-lg p-3.5 bg-white hover:bg-slate-50 transition cursor-grab active:cursor-grabbing ${
                  dragId === id ? "opacity-50 bg-slate-50 border-blue-300" : ""
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-ink-muted shrink-0" aria-hidden>
                    <GripVertical size={18} />
                  </span>
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 shrink-0">
                    <LayoutGrid size={18} className="text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink truncate">
                      {section.title}
                    </h3>
                    <p className="text-xs text-ink-muted">
                      {section.type}
                      {section.isActive === false ? " · inactive" : ""}
                      {section.config?.limit
                        ? ` · limit ${section.config.limit}`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-medium text-ink-muted shrink-0 pl-3">
                  #{index + 1}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default DragDropBuilder;
