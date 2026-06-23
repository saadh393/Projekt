import { useMemo } from "react";
import { ArrowUpDown, Eye, EyeOff, Minus, Plus, Search } from "lucide-react";
import { sortLabels } from "../../lib/constants";
import type { ContextMenuOption } from "../../lib/contextMenuTypes";
import type { SortMode } from "../../lib/types";
import { OverflowMenu } from "../OverflowMenu/OverflowMenu";

type ProjectListToolbarProps = {
  searchQuery: string;
  sortMode: SortMode;
  showHiddenProjects: boolean;
  isReordering: boolean;
  canAddDivider: boolean;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortMode) => void;
  onShowHiddenChange: (value: boolean) => void;
  onReorderToggle: (value: boolean) => void;
  onAddDivider: () => void;
  onAddProject: () => void;
}

export function ProjectListToolbar({
  searchQuery,
  sortMode,
  showHiddenProjects,
  isReordering,
  canAddDivider,
  onSearchChange,
  onSortChange,
  onShowHiddenChange,
  onReorderToggle,
  onAddDivider,
  onAddProject,
}: ProjectListToolbarProps) {
  const overflowOptions = useMemo<ContextMenuOption[]>(
    () => [
      {
        kind: "action",
        id: "reorder",
        label: isReordering ? "Done Reordering" : "Reorder Items",
        icon: <ArrowUpDown size={14} />,
        checked: isReordering,
        onSelect: () => onReorderToggle(!isReordering),
      },
      {
        kind: "action",
        id: "hidden",
        label: showHiddenProjects ? "Hide Hidden Projects" : "Show Hidden Projects",
        icon: showHiddenProjects ? <Eye size={14} /> : <EyeOff size={14} />,
        checked: showHiddenProjects,
        onSelect: () => onShowHiddenChange(!showHiddenProjects),
      },
      { kind: "separator", id: "sep-1" },
      {
        kind: "action",
        id: "divider",
        label: "Add Divider",
        icon: <Minus size={14} />,
        disabled: !canAddDivider,
        onSelect: onAddDivider,
      },
    ],
    [isReordering, showHiddenProjects, canAddDivider, onReorderToggle, onShowHiddenChange, onAddDivider],
  );

  return (
    <div className="flex items-center gap-2 px-6 pb-3">
      <label className="relative min-w-0 flex-1">
        <Search
          size={14}
          style={{ color: "var(--text-tertiary)" }}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
        />
        <input
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          className="field field-with-icon"
          placeholder="Search projects, tags, paths"
        />
      </label>

      <div className="relative">
        <select
          value={sortMode}
          onChange={(event) => onSortChange(event.target.value as SortMode)}
          className="field cursor-default appearance-none pr-7"
          disabled={isReordering}
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

      <OverflowMenu options={overflowOptions} label="More options" />

      <button type="button" onClick={onAddProject} className="btn btn-primary">
        <Plus size={13} />
        New Project
      </button>
    </div>
  );
}
