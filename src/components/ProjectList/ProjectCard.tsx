import { EyeOff, GripVertical, Pencil, Tag } from "lucide-react";
import { findCategoryName } from "../../lib/categoryUtils";
import { cx } from "../../lib/cx";
import type { AppLauncher, Category, Project } from "../../lib/types";
import { useProjectActions } from "../../hooks/useProjects";
import { useProjectUiStore } from "../../store/useProjectUiStore";
import { ActionBar } from "../ProjectDetail/ActionBar";

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
  launchers,
  selected,
  manualMode,
  onSelect,
  onDragStart,
  onDragOver,
  onDrop,
}: ProjectCardProps) {
  const { hideProject } = useProjectActions();
  const setEditingProjectId = useProjectUiStore((state) => state.setEditingProjectId);

  return (
    <article
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
      className={cx(
        "group rounded-xl border bg-white/90 p-4 shadow-sm shadow-zinc-200/70 transition-[border-color,box-shadow,transform,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] dark:bg-zinc-950",
        project.hidden ? "opacity-55" : "",
        selected
          ? "border-zinc-900 shadow-lg shadow-zinc-300/70 ring-2 ring-zinc-900/10 dark:border-zinc-100"
          : "border-white hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:hover:border-zinc-700",
      )}
    >
      <div className="flex gap-3">
        {manualMode ? (
          <button
            type="button"
            className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            aria-label="Drag project"
          >
            <GripVertical size={16} />
          </button>
        ) : null}
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: project.color }} />
            <h3 className={cx("truncate text-base font-semibold text-zinc-950 dark:text-white", project.hidden ? "line-through" : "")}>{project.name}</h3>
            {project.hidden ? <EyeOff size={14} className="shrink-0 text-zinc-400" /> : null}
          </div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
              {findCategoryName(categories, project.categoryId)}
            </span>
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-500 dark:border-zinc-800"
              >
                <Tag size={11} />
                {tag}
              </span>
            ))}
          </div>
          <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">{project.description}</p>
          <p className="mt-2 truncate font-mono text-xs text-zinc-400">{project.path}</p>
        </button>
        <div className="flex shrink-0 items-start gap-1">
          <button
            type="button"
            onClick={() => setEditingProjectId(project.id)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 transition-transform duration-150 active:scale-[0.97] dark:border-zinc-800"
            aria-label={`Edit ${project.name}`}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => hideProject.mutate({ id: project.id, hidden: !project.hidden })}
            className="h-8 rounded-md border border-zinc-200 px-2 text-xs text-zinc-500 transition-transform duration-150 active:scale-[0.97] dark:border-zinc-800"
          >
            {project.hidden ? "Unhide" : "Hide"}
          </button>
        </div>
      </div>
      <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-900">
        <ActionBar project={project} launchers={launchers} compact />
      </div>
    </article>
  );
}
