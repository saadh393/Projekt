import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { sortLabels } from "../../lib/constants";
import type { SortMode } from "../../lib/types";

type ProjectListToolbarProps = {
  searchQuery: string;
  sortMode: SortMode;
  showHiddenProjects: boolean;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortMode) => void;
  onShowHiddenChange: (value: boolean) => void;
  onAddProject: () => void;
};

export function ProjectListToolbar({
  searchQuery,
  sortMode,
  showHiddenProjects,
  onSearchChange,
  onSortChange,
  onShowHiddenChange,
  onAddProject,
}: ProjectListToolbarProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-white/70 bg-[#f6f2ea]/80 px-5 py-4 backdrop-blur-2xl dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-64 flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="h-10 w-full rounded-xl border border-white bg-white/85 pl-9 pr-3 text-sm shadow-sm shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900"
            placeholder="Search projects"
          />
        </label>
        <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-white bg-white/85 px-3 text-sm shadow-sm shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900">
          <SlidersHorizontal size={15} />
          <select
            value={sortMode}
            onChange={(event) => onSortChange(event.target.value as SortMode)}
            className="bg-transparent outline-none"
          >
            {Object.entries(sortLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-white bg-white/85 px-3 text-sm shadow-sm shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900">
          <input
            type="checkbox"
            checked={showHiddenProjects}
            onChange={(event) => onShowHiddenChange(event.target.checked)}
          />
          Show hidden
        </label>
        <button
          type="button"
          onClick={onAddProject}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white shadow-lg shadow-zinc-950/15"
        >
          <Plus size={15} />
          New Project
        </button>
      </div>
    </div>
  );
}
