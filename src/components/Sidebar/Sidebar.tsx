import { FolderKanban, Settings } from "lucide-react";
import { allProjectsCategoryId } from "../../lib/constants";
import { countProjectsByCategory, visibleCategories } from "../../lib/categoryUtils";
import { useProjectUiStore } from "../../store/useProjectUiStore";
import type { Category, Project } from "../../lib/types";
import { AddCategoryPopover } from "../Forms/AddCategoryPopover";
import { CategoryItem } from "./CategoryItem";
import { CategoryMenu } from "./CategoryMenu";

type SidebarProps = {
  categories: Category[];
  projects: Project[];
};

export function Sidebar({ categories, projects }: SidebarProps) {
  const selectedCategoryId = useProjectUiStore((state) => state.selectedCategoryId);
  const setSelectedCategoryId = useProjectUiStore((state) => state.setSelectedCategoryId);
  const setSelectedProjectId = useProjectUiStore((state) => state.setSelectedProjectId);
  const setSettingsOpen = useProjectUiStore((state) => state.setSettingsOpen);
  const counts = countProjectsByCategory(projects);
  const visible = visibleCategories(categories);
  const activeCategory = categories.find((category) => category.id === selectedCategoryId);
  const allCount = projects.filter((project) => !project.hidden).length;
  const isAllSelected = selectedCategoryId === allProjectsCategoryId;

  const handleSelectCategory = (id: string) => {
    setSelectedCategoryId(id);
    setSelectedProjectId(null);
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

      <div className="mt-3 flex items-center justify-between px-3 pb-1">
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-tertiary)" }}
        >
          Categories
        </span>
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
              onSelect={() => handleSelectCategory(category.id)}
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
        {activeCategory ? <CategoryMenu category={activeCategory} /> : null}
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="row"
        >
          <Settings size={14} style={{ color: "var(--text-secondary)" }} />
          <span className="min-w-0 flex-1 truncate text-[13px]">Settings</span>
        </button>
      </div>
    </aside>
  );
}
