import { Boxes, FolderKanban, Settings } from "lucide-react";
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

  const handleSelectCategory = (id: string) => {
    setSelectedCategoryId(id);
    setSelectedProjectId(null);
  };

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-white/70 bg-white/55 px-3 py-4 text-zinc-900 shadow-[inset_-1px_0_0_rgba(255,255,255,0.72)] backdrop-blur-2xl dark:border-zinc-800 dark:bg-zinc-950/80 dark:text-zinc-50">
      <div className="mb-5 flex h-10 items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-950 text-white shadow-lg shadow-zinc-950/15">
            <Boxes size={17} />
          </span>
          <span>
            <span className="block leading-tight">Projekt</span>
            <span className="block text-[11px] font-medium text-zinc-500">Local launcher</span>
          </span>
        </div>
        <AddCategoryPopover sortOrder={categories.length} />
      </div>

      <button
        type="button"
        onClick={() => handleSelectCategory(allProjectsCategoryId)}
        className={`mb-3 flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm shadow-sm ${
          selectedCategoryId === allProjectsCategoryId
            ? "bg-zinc-950 text-white shadow-zinc-950/20"
            : "bg-white/60 hover:bg-white dark:hover:bg-zinc-800"
        }`}
      >
        <span className="inline-flex items-center gap-2">
          <FolderKanban size={15} />
          All Projects
        </span>
        <span className="text-xs opacity-60">{projects.filter((project) => !project.hidden).length}</span>
      </button>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto">
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

      <div className="mt-4 space-y-2">
        {activeCategory ? <CategoryMenu category={activeCategory} /> : null}
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
          className="flex w-full items-center gap-2 rounded-xl bg-white/60 px-3 py-2 text-sm text-zinc-600 shadow-sm hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Settings size={15} />
          Settings
        </button>
      </div>
    </aside>
  );
}
