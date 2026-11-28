"use client";

import { useState, useTransition } from "react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/app/actions/admin-categories";
import {
  FolderPlus,
  Edit2,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  Sparkles,
} from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: {
    products: number;
  };
}

interface CategoryManagerProps {
  initialCategories: CategoryItem[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [isPending, startTransition] = useTransition();

  // Modal / Form state
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isSlugManual, setIsSlugManual] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Auto-generate slug when typing name (if not manually edited)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManual) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditId(null);
    setName("");
    setSlug("");
    setDescription("");
    setIsSlugManual(false);
    setFormError(null);
  };

  const handleOpenEdit = (c: CategoryItem) => {
    setIsEditing(true);
    setEditId(c.id);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || "");
    setIsSlugManual(true);
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    startTransition(async () => {
      if (isEditing && editId) {
        const res = await updateCategory(editId, {
          name,
          slug,
          description: description || undefined,
        });

        if (!res.success) {
          setFormError(res.error || "Failed to update category");
          return;
        }

        setStatusMessage({
          type: "success",
          text: `Category "${name}" updated successfully.`,
        });
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editId
              ? {
                  ...c,
                  name,
                  slug,
                  description: description || null,
                }
              : c
          )
        );
        handleOpenCreate();
      } else {
        const res = await createCategory({
          name,
          slug,
          description: description || undefined,
        });

        if (!res.success) {
          setFormError(res.error || "Failed to create category");
          return;
        }

        setStatusMessage({
          type: "success",
          text: `Category "${name}" created successfully.`,
        });
        if (res.category) {
          setCategories((prev) => [
            ...prev,
            {
              id: res.category!.id,
              name: res.category!.name,
              slug: res.category!.slug,
              description: res.category!.description,
              _count: { products: 0 },
            },
          ]);
        }
        handleOpenCreate();
      }

      setTimeout(() => setStatusMessage(null), 4000);
    });
  };

  const handleDelete = (c: CategoryItem) => {
    if (c._count.products > 0) {
      alert(
        `Cannot delete "${c.name}": it still has ${c._count.products} products assigned to it. Reassign or delete these products first.`
      );
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete category "${c.name}"?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteCategory(c.id);
      if (!res.success) {
        setStatusMessage({
          type: "error",
          text: res.error || "Failed to delete category.",
        });
      } else {
        setStatusMessage({
          type: "success",
          text: `Category "${c.name}" deleted.`,
        });
        setCategories((prev) => prev.filter((item) => item.id !== c.id));
      }
      setTimeout(() => setStatusMessage(null), 4000);
    });
  };

  return (
    <div className="space-y-8">
      {/* Toast Notice */}
      {statusMessage && (
        <div
          className={`flex items-center gap-2 p-4 rounded-md border text-xs font-mono transition-all ${
            statusMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-800" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-800" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Category List (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg bg-slate-50 border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Existing Categories ({categories.length})
                </h2>
                <p className="text-[11px] text-slate-600">
                  Streetwear aesthetics and silhouettes taxonomy.
                </p>
              </div>
            </div>

            {categories.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Boxes className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-600">No categories found in database.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#fff] text-slate-600 uppercase font-mono tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-6">Name</th>
                      <th className="py-3.5 px-4">Slug</th>
                      <th className="py-3.5 px-4">Products</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {categories.map((c) => (
                      <tr
                        key={c.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          editId === c.id ? "bg-slate-50 border-l-2 border-rose-500" : ""
                        }`}
                      >
                        <td className="py-4 px-6 font-bold text-slate-900">
                          <div>
                            <span>{c.name}</span>
                            {c.description && (
                              <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5 font-normal">
                                {c.description}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4 font-mono text-slate-600">
                          /{c.slug}
                        </td>

                        <td className="py-4 px-4">
                          <span className="status-pill" data-live={c._count.products > 0}>
                            {c._count.products} product{c._count.products === 1 ? "" : "s"}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(c)}
                              className="p-1.5 rounded-lg bg-[#fff] hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                              title="Rename / Edit category"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDelete(c)}
                              disabled={isPending}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                c._count.products > 0
                                  ? "bg-[#fff] border-slate-200 text-slate-500 cursor-not-allowed"
                                  : "bg-[#fff] hover:bg-red-50 border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-800"
                              }`}
                              title={
                                c._count.products > 0
                                  ? `Protected: contains ${c._count.products} products`
                                  : `Delete ${c.name}`
                              }
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add / Edit Form (1 Col) */}
        <div className="lg:col-span-1 rounded-lg bg-slate-50 border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-red-800" />
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {isEditing ? "Rename / Edit Category" : "Add New Category"}
              </h2>
            </div>
            {isEditing && (
              <button
                onClick={handleOpenCreate}
                className="text-[11px] text-slate-600 hover:text-slate-700 font-mono transition-colors"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {formError && (
            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase text-slate-600 font-bold">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Graphic Hoodies"
                className="w-full px-3.5 py-2.5 bg-[#fff] border border-slate-200 rounded-md text-xs text-slate-900 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono uppercase text-slate-600 font-bold">
                  Slug (URL Path) *
                </label>
                {!isSlugManual && (
                  <span className="text-[10px] text-red-800 font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Auto
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setIsSlugManual(true);
                  setSlug(e.target.value);
                }}
                placeholder="e.g. graphic-hoodies"
                className="w-full px-3.5 py-2.5 bg-[#fff] border border-slate-200 rounded-md text-xs font-mono text-slate-800 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase text-slate-600 font-bold">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of this clothing category..."
                className="w-full px-3.5 py-2.5 bg-[#fff] border border-slate-200 rounded-md text-xs text-slate-900 placeholder-zinc-600 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !name.trim() || !slug.trim()}
              className="w-full mt-2 py-3 px-4 rounded-md bg-slate-900 hover:bg-slate-700 text-slate-50 font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Category...</span>
                </>
              ) : isEditing ? (
                <span>Update Category</span>
              ) : (
                <span>Save Category</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
