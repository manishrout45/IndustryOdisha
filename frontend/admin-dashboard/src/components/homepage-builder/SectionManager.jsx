import React from "react";
import { EmptyState } from "../ui/PageUI";
import { sectionTypeLabel } from "./SectionFields";

function SectionManager({
  sections,
  onDelete,
  onEdit,
  onToggleActive,
  busyId = null,
}) {
  if (!sections?.length) {
    return (
      <EmptyState
        title="No homepage sections"
        description="Add a hero, breaking news, or category block to get started."
      />
    );
  }

  return (
    <div className="cms-card p-5">
      <h2 className="font-semibold text-ink mb-1">Homepage sections</h2>
      <p className="text-xs text-ink-muted mb-4">
        Edit any block — title, limit, visibility, category, or custom HTML.
      </p>
      <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
        {sections.map((section) => {
          const id = section._id || section.id;
          const active = section.isActive !== false;
          const busy = busyId === id;
          return (
            <div
              key={id}
              className={`border rounded-lg p-3 ${
                active
                  ? "border-slate-200 bg-white"
                  : "border-slate-200 bg-slate-50 opacity-80"
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-ink truncate">
                    {section.title || "Untitled"}
                  </h3>
                  <p className="text-sm text-ink-muted">
                    {sectionTypeLabel(section.type)}
                    {section.config?.limit
                      ? ` · limit ${section.config.limit}`
                      : ""}
                    {!active ? " · hidden" : ""}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                    active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {active ? "On" : "Off"}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onEdit?.(section)}
                  disabled={busy}
                  className="cms-btn-primary text-xs py-1.5"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onToggleActive?.(section)}
                  disabled={busy}
                  className="cms-btn-ghost text-xs py-1.5"
                >
                  {active ? "Hide" : "Show"}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete?.(id)}
                  disabled={busy}
                  className="cms-btn-danger text-xs py-1.5"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SectionManager;
