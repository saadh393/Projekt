import { useState } from "react";
import { ArrowUpDown, Check, FolderKanban, Settings } from "lucide-react";
import { allProjectsCategoryId } from "../../lib/constants";
import { countProjectsByCategory, visibleCategories } from "../../lib/categoryUtils";
import { moveItem } from "../../lib/reorder";
import { useCategoryActions } from "../../hooks/useCategories";
import { useProjectUiStore } from "../../store/useProjectUiStore";
import type { Category, Project } from "../../lib/types";
import { AddCategoryPopover } from "../Forms/AddCategoryPopover";
import { CategoryItem } from "./CategoryItem";

type SidebarProps = {
  categories: Category[];
  projects: Project[];
};

export function Sidebar({ categories, projects }: SidebarProps) {
  const selectedCategoryId = useProjectUiStore((state) => state.selectedCategoryId);
  const setSelectedCategoryId = useProjectUiStore((state) => state.setSelectedCategoryId);
  const setSelectedProjectId = useProjectUiStore((state) => state.setSelectedProjectId);
  const setSettingsOpen = useProjectUiStore((state) => state.setSettingsOpen);
  const isReordering = useProjectUiStore((state) => state.isReorderingCategories);
  const setReordering = useProjectUiStore((state) => state.setReorderingCategories);
  const { reorderCategories } = useCategoryActions();
  const counts = countProjectsByCategory(projects);
  const visible = visibleCategories(categories);
  const allCount = projects.filter((project) => !project.hidden).length;
  const isAllSelected = selectedCategoryId === allProjectsCategoryId;
  const [draggingCategoryId, setDraggingCategoryId] = useState<string | null>(null);

  const handleSelectCategory = (id: string) => {
    setSelectedCategoryId(id);
    setSelectedProjectId(null);
  };

  const reorderVisibleCategories = (targetCategoryId: string) => {
    if (!draggingCategoryId || draggingCategoryId === targetCategoryId) {
      return;
    }

    const fromIndex = visible.findIndex((category) => category.id === draggingCategoryId);
    const toIndex = visible.findIndex((category) => category.id === targetCategoryId);
    const reordered = moveItem(visible, fromIndex, toIndex);

    reorderCategories.mutate(reordered.map((category) => category.id));
    setDraggingCategoryId(null);
  };

  return (
    <aside
      className="flex h-screen w-56 shrink-0 flex-col pt-7"
      style={{
        background: "var(--bg-sidebar)",
        backdropFilter: "saturate(180%) blur(24px)",
        WebkitBackdropFilter: "saturate(180%) blur(24px)",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex items-center gap-2 px-3 pb-3 pt-2">
        <img src="/logo.png" alt="Projekt" className="h-6 w-6 rounded-md shadow-sm" />
        <span className="text-[14px] font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Projekt
        </span>
      </div>

      <div className="px-2">
        <button
          type="button"
          onClick={() => handleSelectCategory(allProjectsCategoryId)}
          className="row"
          data-selected={isAllSelected}
        >
          <FolderKanban size={14} style={{ color: isAllSelected ? "#fff" : "var(--text-secondary)" }} />
          <span className="min-w-0 flex-1 truncate text-[13px] font-medium">All Projects</span>
          <span
            className="row-meta text-[11px]"
            style={{ color: isAllSelected ? "rgba(255,255,255,0.85)" : "var(--text-tertiary)" }}
          >
            {allCount}
          </span>
        </button>
      </div>

      <div className="mt-3 flex items-center gap-1 px-3 pb-1">
        <span
          className="flex-1 text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-tertiary)" }}
        >
          Categories
        </span>
        {categories.length > 1 ? (
          <button
            type="button"
            onClick={() => setReordering(!isReordering)}
            className="btn-icon"
            aria-label={isReordering ? "Finish reordering" : "Reorder categories"}
            title={isReordering ? "Finish reordering" : "Reorder categories"}
            style={{
              background: isReordering ? "var(--accent-soft)" : undefined,
              color: isReordering ? "var(--accent)" : undefined,
            }}
          >
            {isReordering ? <Check size={13} /> : <ArrowUpDown size={13} />}
          </button>
        ) : null}
        <AddCategoryPopover sortOrder={categories.length} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-visible px-2">
        {visible.length ? (
          visible.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              count={counts[category.id] ?? 0}
              selected={selectedCategoryId === category.id}
              reordering={isReordering}
              onSelect={() => handleSelectCategory(category.id)}
              onDragStart={() => setDraggingCategoryId(category.id)}
              onDragOver={() => undefined}
              onDrop={() => reorderVisibleCategories(category.id)}
            />
          ))
        ) : (
          <div
            className="mx-1 mt-1 rounded-[8px] border border-dashed px-3 py-3 text-center text-[11px]"
            style={{ borderColor: "var(--border-strong)", color: "var(--text-tertiary)" }}
          >
            No categories yet. Tap + above to add one.
          </div>
        )}
      </div>

      <div className="border-t px-2 py-2" style={{ borderColor: "var(--border-divider)" }}>
        <button type="button" onClick={() => setSettingsOpen(true)} className="row">
          <Settings size={14} style={{ color: "var(--text-secondary)" }} />
          <span className="min-w-0 flex-1 truncate text-[13px]">Settings</span>
        </button>
      </div>
    </aside>
  );
}
