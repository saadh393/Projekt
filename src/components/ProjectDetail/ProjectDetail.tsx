import { CalendarClock, Eye, EyeOff, Folder, Pencil, Tag } from "lucide-react";
import { findCategoryName } from "../../lib/categoryUtils";
import { useProjectActions } from "../../hooks/useProjects";
import { useProjectUiStore } from "../../store/useProjectUiStore";
import type { AppLauncher, Category, CommandTemplate, Project } from "../../lib/types";
import { ActionBar } from "./ActionBar";
import { CommandRunner } from "./CommandRunner";

type ProjectDetailProps = {
  project: Project | null;
  categories: Category[];
  launchers: AppLauncher[];
  commandTemplates: CommandTemplate[];
  embedded?: boolean;
};

export function ProjectDetail({
  project,
  categories,
  launchers,
  commandTemplates,
  embedded = false,
}: ProjectDetailProps) {
  const setEditingProjectId = useProjectUiStore((state) => state.setEditingProjectId);
  const { hideProject } = useProjectActions();

  const shell = embedded
    ? "flex h-full min-h-0 w-full flex-col"
    : "scroll-shell hidden h-screen w-[360px] shrink-0 flex-col overflow-hidden border-l lg:flex";

  const shellStyle = embedded
    ? undefined
    : {
        borderColor: "var(--border-subtle)",
        background: "var(--bg-sidebar)",
        backdropFilter: "saturate(180%) blur(24px)",
        WebkitBackdropFilter: "saturate(180%) blur(24px)",
      };

  return (
    <section className={shell} style={shellStyle}>
      {embedded ? null : <div className="titlebar" data-tauri-drag-region />}

      {!project ? (
        <div
          className="no-drag flex flex-1 flex-col items-center justify-center px-8 text-center text-[13px]"
          style={{ color: "var(--text-tertiary)" }}
        >
          <div
            className="mb-3 flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: "var(--bg-hover)" }}
          >
            <Folder size={18} />
          </div>
          <span style={{ color: "var(--text-secondary)" }}>Select a project to see details</span>
        </div>
      ) : (
        <div className="no-drag min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-1">
          <div className="mb-4 flex items-start gap-3">
            <span
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: project.color }}
            />
            <div className="min-w-0 flex-1">
              <h2
                className="break-words text-[18px] font-semibold leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {project.name}
              </h2>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="chip">{findCategoryName(categories, project.categoryId)}</span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => setEditingProjectId(project.id)}
                className="btn-icon"
                aria-label={`Edit ${project.name}`}
                title="Edit"
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                onClick={() => hideProject.mutate({ id: project.id, hidden: !project.hidden })}
                className="btn-icon"
                aria-label={project.hidden ? "Unhide project" : "Hide project"}
                title={project.hidden ? "Unhide" : "Hide"}
              >
                {project.hidden ? <Eye size={13} /> : <EyeOff size={13} />}
              </button>
            </div>
          </div>

          {project.description ? (
            <p
              className="mb-4 text-[13px] leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {project.description}
            </p>
          ) : null}

          <ActionBar project={project} launchers={launchers} />

          <div
            className="mt-5 space-y-3 rounded-[10px] border p-3"
            style={{
              background: "rgba(255,255,255,0.65)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <div className="flex items-start gap-2.5">
              <Folder size={13} className="mt-0.5 shrink-0" style={{ color: "var(--text-tertiary)" }} />
              <span
                className="break-all font-mono text-[11px]"
                style={{ color: "var(--text-secondary)" }}
              >
                {project.path}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <CalendarClock size={13} className="shrink-0" style={{ color: "var(--text-tertiary)" }} />
              <span className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
                {project.lastOpenedAt
                  ? new Date(project.lastOpenedAt * 1000).toLocaleString()
                  : "Never opened"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag size={13} className="shrink-0" style={{ color: "var(--text-tertiary)" }} />
              {project.tags.length ? (
                project.tags.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                  No tags
                </span>
              )}
            </div>
          </div>

          <div className="mt-5">
            <h3
              className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Pinned Commands
            </h3>
            <CommandRunner project={project} templates={commandTemplates} />
          </div>
        </div>
      )}
    </section>
  );
}
