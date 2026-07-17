import { confirm } from "@tauri-apps/plugin-dialog";
import { CalendarClock, Eye, EyeOff, Folder, Pencil, Tag, Trash2 } from "lucide-react";
import { findCategoryName } from "../../lib/categoryUtils";
import { useProjectActions } from "../../hooks/useProjects";
import { getDeleteProjectMessage } from "../../lib/projectDelete";
import { useProjectUiStore } from "../../store/useProjectUiStore";
import type { AppLauncher, Category, Project } from "../../lib/types";
import { ActionBar } from "./ActionBar";
import { CommandManager } from "../Commands/CommandManager";

type ProjectDetailProps = {
  project: Project | null;
  categories: Category[];
  launchers: AppLauncher[];
  embedded?: boolean;
  onCommandRun?: () => void;
};

export function ProjectDetail({
  project,
  categories,
  launchers,
  embedded = false,
  onCommandRun,
}: ProjectDetailProps) {
  const setEditingProjectId = useProjectUiStore((state) => state.setEditingProjectId);
  const setSelectedProjectId = useProjectUiStore((state) => state.setSelectedProjectId);
  const { hideProject, deleteProject } = useProjectActions();

  const shell = embedded
    ? "flex h-full min-h-0 w-full flex-col"
    : "scroll-shell hidden h-screen w-[360px] shrink-0 flex-col overflow-hidden border-l pt-7 lg:flex";

  const shellStyle = embedded
    ? undefined
    : {
        borderColor: "var(--border-subtle)",
        background: "var(--bg-sidebar)",
        backdropFilter: "saturate(180%) blur(24px)",
        WebkitBackdropFilter: "saturate(180%) blur(24px)",
      };

  const handleDelete = async (currentProject: Project) => {
    const confirmed = await confirm(getDeleteProjectMessage(currentProject.name), {
      title: "Delete Project",
      kind: "warning",
      okLabel: "Delete",
      cancelLabel: "Cancel",
    });

    if (confirmed) {
      deleteProject.mutate(currentProject.id, {
        onSuccess: () => setSelectedProjectId(null),
      });
    }
  };

  return (
    <section className={shell} style={shellStyle}>
      {!project ? (
        <div
          className="flex flex-1 flex-col items-center justify-center px-8 text-center text-[13px]"
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
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-2">
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
              <button
                type="button"
                onClick={() => void handleDelete(project)}
                className="btn-icon btn-destructive"
                aria-label={`Delete ${project.name}`}
                title="Delete"
              >
                <Trash2 size={13} />
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
            <CommandManager
              projectId={project.id}
              title={
                <h3
                  className="text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  Commands
                </h3>
              }
              onCommandRun={onCommandRun}
            />
          </div>
        </div>
      )}
    </section>
  );
}
