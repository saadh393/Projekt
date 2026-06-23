import { EyeOff, GripVertical } from "lucide-react";
import { findCategoryName } from "../../lib/categoryUtils";
import { cx } from "../../lib/cx";
import type { AppLauncher, Category, Project } from "../../lib/types";

type ProjectCardProps = {
  project: Project;
  categories: Category[];
  launchers: AppLauncher[];
  selected: boolean;
  manualMode: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
};

export function ProjectCard({
  project,
  categories,
  selected,
  manualMode,
  onSelect,
  onDragStart,
  onDragOver,
  onDrop,
}: ProjectCardProps) {
  const categoryName = findCategoryName(categories, project.categoryId);

  return (
    <div
      draggable={manualMode}
      onDragStart={onDragStart}
      onDragOver={(event) => {
        if (manualMode) {
          event.preventDefault();
          onDragOver();
        }
      }}
      onDrop={(event) => {
        if (manualMode) {
          event.preventDefault();
          onDrop();
        }
      }}
      className={cx("group", project.hidden ? "opacity-60" : "")}
    >
      <button type="button" onClick={onSelect} className="row" data-selected={selected}>
        {manualMode ? (
          <GripVertical
            size={12}
            style={{ color: selected ? "rgba(255,255,255,0.7)" : "var(--text-tertiary)" }}
            className="cursor-grab"
          />
        ) : (
          <span className="dot" style={{ backgroundColor: project.color }} />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cx(
                "truncate text-[13px] font-medium",
                project.hidden ? "line-through" : "",
              )}
            >
              {project.name}
            </span>
            {project.hidden ? (
              <EyeOff
                size={11}
                style={{ color: selected ? "rgba(255,255,255,0.7)" : "var(--text-tertiary)" }}
              />
            ) : null}
          </div>
          <div
            className="row-sub mt-0.5 truncate font-mono text-[11px]"
            style={{ color: selected ? "rgba(255,255,255,0.75)" : "var(--text-tertiary)" }}
          >
            {project.path}
          </div>
        </div>

        <div className="row-meta flex shrink-0 items-center gap-1.5">
          {project.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="chip">
              {tag}
            </span>
          ))}
          {categoryName ? <span className="chip">{categoryName}</span> : null}
        </div>
      </button>
    </div>
  );
}
