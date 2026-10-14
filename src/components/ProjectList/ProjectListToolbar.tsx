import { useMemo } from "react";
import { ArrowUpDown, Check, Eye, EyeOff, Minus, Plus, Search } from "lucide-react";
import { sortLabels } from "../../lib/constants";
import type { ContextMenuOption } from "../../lib/contextMenuTypes";
import type { SortMode } from "../../lib/types";
import { OverflowMenu } from "../OverflowMenu/OverflowMenu";

type ProjectListToolbarProps = {
  searchQuery: string;
  sortMode: SortMode;
  showHiddenProjects: boolean;
  isReordering: boolean;
  canReorder: boolean;
  canAddDivider: boolean;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortMode) => void;
  onShowHiddenChange: (value: boolean) => void;
  onReorderToggle: () => void;
  onAddDivider: () => void;
  onAddProject: () => void;
}

export function ProjectListToolbar({
  searchQuery,
  sortMode,
  showHiddenProjects,
  isReordering,
  canReorder,
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
    [showHiddenProjects, canAddDivider, onShowHiddenChange, onAddDivider],
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
          disabled={isReordering}
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

      {isReordering ? (
        <button type="button" onClick={onReorderToggle} className="btn btn-primary">
          <Check size={13} />
          Done
        </button>
      ) : (
        <button
          type="button"
          onClick={onReorderToggle}
          className="btn"
          disabled={!canReorder}
          title="Drag and drop to reorder"
        >
          <ArrowUpDown size={13} />
          Reorder
        </button>
      )}

      <OverflowMenu options={overflowOptions} label="More options" disabled={isReordering} />

      <button
        type="button"
        onClick={onAddProject}
        className="btn btn-primary"
        disabled={isReordering}
      >
        <Plus size={13} />
        New Project
      </button>
    </div>
  );
}
