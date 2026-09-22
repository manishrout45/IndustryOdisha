import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { PageHeader } from "../components/ui/PageUI";
import CategoryForm from "../components/categories/CategoryForm";
import CategoryTable from "../components/categories/CategoryTable";
import CategoryEditPanel from "../components/categories/CategoryEditPanel";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "../services/categoryService";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const fetchCategories = async () => {
    try {
      const response = await getCategories();
      const list = response?.data || response || [];
      setCategories(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error(error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const refreshAndSyncEdit = async (editId) => {
    const response = await getCategories();
    const list = response?.data || response || [];
    const next = Array.isArray(list) ? list : [];
    setCategories(next);
    if (editId) {
      const found = next.find((c) => c._id === editId);
      setEditing(found || null);
    }
  };

  const handleCreate = async (data) => {
    try {
      await createCategory(data);
      await fetchCategories();
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to create category");
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this category and all of its subcategories?"
      )
    ) {
      return;
    }
    try {
      await deleteCategory(id);
      if (editing?._id === id) setEditing(null);
      await fetchCategories();
    } catch (error) {
      alert(error?.response?.data?.message || "Delete failed");
    }
  };

  const handleReorder = async (orderedIds) => {
    const previous = categories;
    const byId = Object.fromEntries(categories.map((c) => [c._id, c]));
    setCategories(orderedIds.map((id) => byId[id]).filter(Boolean));
    try {
      const res = await reorderCategories({ orderedIds, parentId: null });
      const list = res?.data || res || [];
      if (Array.isArray(list)) setCategories(list);
    } catch (error) {
      setCategories(previous);
      alert(error?.response?.data?.message || "Reorder failed");
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      await updateCategory(id, data);
      await refreshAndSyncEdit(id);
    } catch (error) {
      alert(error?.response?.data?.message || "Update failed");
    }
  };

  const handleAddSub = async (data) => {
    try {
      await createCategory(data);
      await refreshAndSyncEdit(editing?._id);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to add subcategory");
    }
  };

  const handleUpdateSub = async (id, data) => {
    try {
      await updateCategory(id, data);
      await refreshAndSyncEdit(editing?._id);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update subcategory");
    }
  };

  const handleDeleteSub = async (id) => {
    try {
      await deleteCategory(id);
      await refreshAndSyncEdit(editing?._id);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete subcategory");
    }
  };

  const handleReorderSubs = async (parentId, orderedIds) => {
    try {
      const res = await reorderCategories({ orderedIds, parentId });
      const list = res?.data || res || [];
      if (Array.isArray(list)) {
        setCategories(list);
        setEditing(list.find((c) => c._id === parentId) || null);
      }
    } catch (error) {
      alert(error?.response?.data?.message || "Subcategory reorder failed");
    }
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Categories"
        subtitle="Drag to reorder nav · edit to manage subcategories for header dropdowns"
      />

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <CategoryForm onCreate={handleCreate} />
        </div>
        <div className="lg:col-span-8">
          {loading ? (
            <div className="cms-card p-8 text-ink-muted text-center">
              Loading…
            </div>
          ) : (
            <CategoryTable
              categories={categories}
              onDelete={handleDelete}
              onEdit={setEditing}
              onReorder={handleReorder}
            />
          )}
        </div>
      </div>

      <CategoryEditPanel
        category={editing}
        onClose={() => setEditing(null)}
        onUpdate={handleUpdate}
        onAddSub={handleAddSub}
        onUpdateSub={handleUpdateSub}
        onDeleteSub={handleDeleteSub}
        onReorderSubs={handleReorderSubs}
      />
    </DashboardLayout>
  );
}

export default Categories;
