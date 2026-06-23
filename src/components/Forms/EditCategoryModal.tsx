import { useEffect, useMemo, useState } from "react";
import { Trash2, X } from "lucide-react";
import { useCategoryActions } from "../../hooks/useCategories";
import { useMountTransition } from "../../hooks/useMountTransition";
import { sidebarColors } from "../../lib/constants";
import { filterIconNames, getCategoryIcon } from "../../lib/iconRegistry";
import { useProjectUiStore } from "../../store/useProjectUiStore";
import type { Category } from "../../lib/types";

type EditCategoryModalProps = {
  categories: Category[];
};

export function EditCategoryModal({ categories }: EditCategoryModalProps) {
  const editingId = useProjectUiStore((state) => state.editingCategoryId);
  const setEditingId = useProjectUiStore((state) => state.setEditingCategoryId);
  const category = useMemo(
    () => categories.find((entry) => entry.id === editingId) ?? null,
    [categories, editingId],
  );
  const { render, state } = useMountTransition(Boolean(category), 240);
  const { updateCategory, deleteCategory } = useCategoryActions();

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [iconQuery, setIconQuery] = useState("");
  const [color, setColor] = useState(sidebarColors[0]);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setIcon(category.icon);
      setColor(category.color);
      setIconQuery("");
    }
  }, [category?.id]);

  const iconNames = useMemo(() => filterIconNames(iconQuery).slice(0, 25), [iconQuery]);

  const close = () => setEditingId(null);

  const handleSave = () => {
    if (!category || !name.trim()) return;
    updateCategory.mutate(
      {
        id: category.id,
        category: {
          name: name.trim(),
          icon,
          color,
          sortOrder: category.sortOrder,
        },
      },
      { onSuccess: close },
    );
  };

  const handleDelete = () => {
    if (!category) return;
    deleteCategory.mutate(category.id, { onSuccess: close });
  };

  if (!render || !category) {
    return null;
  }

  return (
    <div className="modal-backdrop" data-state={state} onClick={close}>
      <section
        className="modal-panel w-[440px] max-w-[90vw]"
        data-state={state}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="relative flex items-center justify-center border-b"
          style={{ borderColor: "var(--border-divider)", height: 44 }}
        >
          <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
            Edit Category
          </h2>
          <button type="button" onClick={close} className="btn-icon absolute right-2" aria-label="Close">
            <X size={13} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="space-y-1.5">
            <span
              className="block text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Name
            </span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="field"
              placeholder="Category name"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <span
              className="block text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Icon
            </span>
            <input
              value={iconQuery}
              onChange={(event) => setIconQuery(event.target.value)}
              className="field"
              placeholder="Search icons"
            />
            <div className="grid grid-cols-10 gap-1 pt-1">
              {iconNames.map((iconName) => {
                const Icon = getCategoryIcon(iconName);
                const active = icon === iconName;

                return (
                  <button
                    key={iconName}
                    type="button"
                    title={iconName}
                    onClick={() => setIcon(iconName)}
                    className="flex h-7 items-center justify-center rounded"
                    style={{
                      background: active ? "var(--accent-soft)" : "transparent",
                      color: active ? "var(--accent)" : "var(--text-secondary)",
                    }}
                  >
                    <Icon size={14} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <span
              className="block text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Color
            </span>
            <div className="flex flex-wrap gap-2">
              {sidebarColors.map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-label={option}
                  onClick={() => setColor(option)}
                  className="h-6 w-6 rounded-full"
                  style={{
                    backgroundColor: option,
                    boxShadow:
                      color === option
                        ? "0 0 0 2px #fff, 0 0 0 4px var(--accent)"
                        : "inset 0 0 0 1px rgba(0,0,0,0.1)",
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className="flex items-center justify-between gap-2 border-t px-5 py-3"
          style={{ borderColor: "var(--border-divider)" }}
        >
          <button type="button" onClick={handleDelete} className="btn btn-destructive">
            <Trash2 size={13} />
            Delete
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={close} className="btn">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="btn btn-primary" disabled={!name.trim()}>
              Save Changes
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
