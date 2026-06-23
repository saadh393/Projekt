import { CalendarClock, Folder, Pencil, Tag } from "lucide-react";
import { findCategoryName } from "../../lib/categoryUtils";
import { useProjectUiStore } from "../../store/useProjectUiStore";
import type { AppLauncher, Category, CommandTemplate, Project } from "../../lib/types";
import { ActionBar } from "./ActionBar";
import { CommandRunner } from "./CommandRunner";

type ProjectDetailProps = {
  project: Project | null;
  categories: Category[];
  launchers: AppLauncher[];
  commandTemplates: CommandTemplate[];
};

export function ProjectDetail({
  project,
  categories,
  launchers,
  commandTemplates,
}: ProjectDetailProps) {
  const setEditingProjectId = useProjectUiStore((state) => state.setEditingProjectId);

  if (!project) {
    return (
      <section className="hidden h-screen w-96 shrink-0 border-l border-white/70 bg-white/45 px-5 py-5 text-zinc-500 backdrop-blur-2xl dark:border-zinc-800 dark:bg-zinc-950 lg:block">
        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white bg-white/35 text-sm dark:border-zinc-800">
          Select a project
        </div>
      </section>
    );
  }

  return (
    <section className="hidden h-screen w-96 shrink-0 overflow-y-auto border-l border-white/70 bg-white/45 px-5 py-5 backdrop-blur-2xl dark:border-zinc-800 dark:bg-zinc-950 lg:block">
      <div className="mb-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
        <span className="rounded-lg bg-white/80 px-2 py-1 text-xs text-zinc-600 shadow-sm dark:bg-zinc-800 dark:text-zinc-300">
            {findCategoryName(categories, project.categoryId)}
          </span>
        </div>
        <div className="flex items-start gap-3">
          <h2 className="min-w-0 flex-1 break-words text-2xl font-semibold text-zinc-950 dark:text-white">{project.name}</h2>
          <button
            type="button"
            onClick={() => setEditingProjectId(project.id)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white bg-white/85 text-zinc-600 shadow-sm transition-transform duration-150 active:scale-[0.97] dark:border-zinc-800 dark:bg-zinc-900"
            aria-label={`Edit ${project.name}`}
          >
            <Pencil size={15} />
          </button>
        </div>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{project.description}</p>
      </div>

      <ActionBar project={project} launchers={launchers} />

      <div className="mt-5 space-y-3 rounded-2xl border border-white bg-white/80 p-3 text-sm shadow-sm shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-start gap-2">
          <Folder size={15} className="mt-0.5 shrink-0 text-zinc-500" />
          <span className="break-all font-mono text-xs text-zinc-600 dark:text-zinc-300">{project.path}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarClock size={15} className="text-zinc-500" />
          <span className="text-zinc-600 dark:text-zinc-300">
            {project.lastOpenedAt ? new Date(project.lastOpenedAt * 1000).toLocaleString() : "Never opened"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tag size={15} className="text-zinc-500" />
          {project.tags.length ? (
            project.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-800">
                {tag}
              </span>
            ))
          ) : (
            <span className="text-zinc-500">No tags</span>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Pinned Commands</h3>
        <CommandRunner project={project} templates={commandTemplates} />
      </div>
    </section>
  );
}
