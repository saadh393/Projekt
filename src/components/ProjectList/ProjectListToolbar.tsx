import { Eye, EyeOff, Plus, Search } from "lucide-react";
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
    <div
      className="no-drag flex items-center gap-2 px-6 pb-3"
    >
      <label className="relative min-w-0 flex-1">
        <Search
          size={13}
          style={{ color: "var(--text-tertiary)" }}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2"
        />
        <input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="field pl-7"
          placeholder="Search projects, tags, paths"
        />
      </label>

      <div className="relative">
        <select
          value={sortMode}
          onChange={(event) => onSortChange(event.target.value as SortMode)}
          className="field cursor-default pr-7 appearance-none"
          style={{ paddingLeft: 10 }}
        >
          {Object.entries(sortLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <span
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px]"
          style={{ color: "var(--text-tertiary)" }}
        >
          ▾
        </span>
      </div>

      <button
        type="button"
        onClick={() => onShowHiddenChange(!showHiddenProjects)}
        className="btn"
        title={showHiddenProjects ? "Hide hidden projects" : "Show hidden projects"}
        aria-pressed={showHiddenProjects}
        style={{
          background: showHiddenProjects ? "var(--accent-soft)" : undefined,
          color: showHiddenProjects ? "var(--accent)" : undefined,
          borderColor: showHiddenProjects ? "transparent" : undefined,
        }}
      >
        {showHiddenProjects ? <Eye size={13} /> : <EyeOff size={13} />}
        Hidden
      </button>

      <button type="button" onClick={onAddProject} className="btn btn-primary">
        <Plus size={13} />
        New Project
      </button>
    </div>
  );
}
