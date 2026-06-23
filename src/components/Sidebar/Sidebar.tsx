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
      className="flex h-screen w-56 shrink-0 flex-col"
      style={{
        background: "var(--bg-sidebar)",
        backdropFilter: "saturate(180%) blur(24px)",
        WebkitBackdropFilter: "saturate(180%) blur(24px)",
        borderRight: "1px solid var(--border-subtle)",
      }}
    >
      <div className="titlebar" data-tauri-drag-region />

      <div className="flex items-center justify-between px-3 pb-2 pt-1 no-drag">
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-tertiary)" }}
        >
          Projekt
        </span>
        <AddCategoryPopover sortOrder={categories.length} />
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
          <span className="row-meta text-[11px]" style={{ color: isAllSelected ? "#fff" : "var(--text-tertiary)" }}>
            {allCount}
          </span>
        </button>
      </div>

      <div className="mt-3 px-3 pb-1">
        <span
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-tertiary)" }}
        >
          Categories
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2">
        {visible.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            count={counts[category.id] ?? 0}
            selected={selectedCategoryId === category.id}
            onSelect={() => handleSelectCategory(category.id)}
          />
        ))}
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
