import React, { useEffect, useState } from "react";

import DashboardLayout from "../components/layout/DashboardLayout";
import { PageHeader } from "../components/ui/PageUI";

import SectionManager from "../components/homepage-builder/SectionManager";
import SectionForm from "../components/homepage-builder/SectionForm";
import SectionEditor from "../components/homepage-builder/SectionEditor";
import DragDropBuilder from "../components/homepage-builder/DragDropBuilder";

import {
  getHomepageSections,
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
  reorderHomepageSections,
  ensureHomepageDefaults,
} from "../api/homepageApi";

function sortByOrder(list = []) {
  return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function HomepageBuilder() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [editing, setEditing] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await getHomepageSections();
      const list = res.data?.data ?? res.data ?? [];
      setSections(sortByOrder(Array.isArray(list) ? list : []));
    } catch (error) {
      console.error("Error fetching sections:", error);
      alert(
        error?.response?.data?.message || "Failed to load homepage sections"
      );
    } finally {
      setLoading(false);
    }
  };

  const syncDefaults = async () => {
    try {
      setSyncing(true);
      const res = await ensureHomepageDefaults();
      const list = res.data?.data ?? res.data ?? [];
      setSections(sortByOrder(Array.isArray(list) ? list : []));
    } catch (error) {
      console.error("Error syncing defaults:", error);
      alert(
        error?.response?.data?.message || "Failed to sync default sections"
      );
    } finally {
      setSyncing(false);
    }
  };

  const addSection = async (section) => {
    try {
      setSubmitting(true);
      const res = await createHomepageSection(section);
      if (res.data?.success !== false) {
        const created = res.data?.data ?? res.data;
        if (created) {
          setSections((prev) => sortByOrder([...prev, created]));
        } else {
          await fetchSections();
        }
      }
    } catch (error) {
      console.error("Error creating section:", error);
      alert(error?.response?.data?.message || "Failed to add section");
    } finally {
      setSubmitting(false);
    }
  };

  const saveSection = async (payload) => {
    if (!editing) return;
    const id = editing._id || editing.id;
    try {
      setSavingEdit(true);
      const res = await updateHomepageSection(id, payload);
      const updated = res.data?.data ?? res.data;
      if (updated) {
        setSections((prev) =>
          sortByOrder(
            prev.map((s) =>
              String(s._id || s.id) === String(id) ? { ...s, ...updated } : s
            )
          )
        );
      } else {
        await fetchSections();
      }
      setEditing(null);
    } catch (error) {
      console.error("Error updating section:", error);
      alert(error?.response?.data?.message || "Failed to save section");
    } finally {
      setSavingEdit(false);
    }
  };

  const toggleActive = async (section) => {
    const id = section._id || section.id;
    const next = !(section.isActive !== false);
    try {
      setBusyId(id);
      const res = await updateHomepageSection(id, { isActive: next });
      const updated = res.data?.data ?? res.data;
      setSections((prev) =>
        prev.map((s) =>
          String(s._id || s.id) === String(id)
            ? { ...s, ...(updated || {}), isActive: next }
            : s
        )
      );
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update visibility");
    } finally {
      setBusyId(null);
    }
  };

  const deleteSection = async (id) => {
    const confirmDelete = window.confirm("Delete this homepage section?");
    if (!confirmDelete) return;

    try {
      setBusyId(id);
      await deleteHomepageSection(id);
      setSections((prev) => prev.filter((section) => section._id !== id));
    } catch (error) {
      console.error("Error deleting section:", error);
      alert(error?.response?.data?.message || "Failed to delete section");
    } finally {
      setBusyId(null);
    }
  };

  const handleReorder = async (orderedIds) => {
    const previous = sections;
    const byId = new Map(sections.map((s) => [s._id || s.id, s]));
    const optimistic = orderedIds
      .map((id, index) => {
        const section = byId.get(id);
        return section ? { ...section, order: index } : null;
      })
      .filter(Boolean);
    setSections(optimistic);

    try {
      setReordering(true);
      const res = await reorderHomepageSections(orderedIds);
      const list = res.data?.data ?? res.data;
      if (Array.isArray(list)) {
        setSections(sortByOrder(list));
      }
    } catch (error) {
      console.error("Error reordering sections:", error);
      setSections(previous);
      alert(error?.response?.data?.message || "Failed to save new order");
    } finally {
      setReordering(false);
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Homepage builder"
        subtitle="Edit, show/hide, and reorder every public homepage section"
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={syncDefaults}
              disabled={syncing || loading}
              className="cms-btn-ghost"
            >
              {syncing ? "Syncing…" : "Restore missing defaults"}
            </button>
            <button
              type="button"
              onClick={fetchSections}
              className="cms-btn-ghost"
            >
              Refresh
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="cms-card p-10 text-center text-ink-muted">
          Loading homepage sections…
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            <SectionForm onAdd={addSection} loading={submitting} />
            <SectionManager
              sections={sections}
              onDelete={deleteSection}
              onEdit={setEditing}
              onToggleActive={toggleActive}
              busyId={busyId}
            />
          </div>

          <div className="mt-8">
            <DragDropBuilder
              sections={sections}
              onReorder={handleReorder}
              saving={reordering}
            />
          </div>
        </>
      )}

      <SectionEditor
        section={editing}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        onSave={saveSection}
        loading={savingEdit}
      />
    </DashboardLayout>
  );
}

export default HomepageBuilder;
