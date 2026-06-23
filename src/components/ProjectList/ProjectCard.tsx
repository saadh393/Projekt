import { useMemo, type MouseEvent } from "react";
import { confirm } from "@tauri-apps/plugin-dialog";
import { Code2, Eye, EyeOff, FolderOpen, GripVertical, Pencil, Terminal, Trash2 } from "lucide-react";
import { findCategoryName } from "../../lib/categoryUtils";
import { cx } from "../../lib/cx";
import { getDeleteProjectMessage } from "../../lib/projectDelete";
import type { AppLauncher, Category, Project } from "../../lib/types";
import type { ContextMenuOption } from "../../lib/contextMenuTypes";
import { useContextMenu } from "../../hooks/useContextMenu";
import { useProjectActions } from "../../hooks/useProjects";
import { useProjectUiStore } from "../../store/useProjectUiStore";
import { ContextMenu } from "../ContextMenu/ContextMenu";

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
  const setEditingProjectId = useProjectUiStore((state) => state.setEditingProjectId);
  const setSelectedProjectId = useProjectUiStore((state) => state.setSelectedProjectId);
  const { hideProject, deleteProject, openFinder, openVsCode, openTerminal } = useProjectActions();
  const { position, open, close } = useContextMenu();

  const handleDelete = async () => {
    const confirmed = await confirm(getDeleteProjectMessage(project.name), {
      title: "Delete Project",
      kind: "warning",
      okLabel: "Delete",
      cancelLabel: "Cancel",
    });

    if (confirmed) {
      deleteProject.mutate(project.id, {
        onSuccess: () => setSelectedProjectId(null),
      });
    }
  };

  const options = useMemo<ContextMenuOption[]>(
    () => [
      {
        kind: "action",
        id: "finder",
        label: "Open in Finder",
        icon: <FolderOpen size={14} />,
        onSelect: () => openFinder.mutate(project.id),
      },
      {
        kind: "action",
        id: "vscode",
        label: "Open in VS Code",
        icon: <Code2 size={14} />,
        onSelect: () => openVsCode.mutate(project.id),
      },
      {
        kind: "action",
        id: "terminal",
        label: "Open in Terminal",
        icon: <Terminal size={14} />,
        onSelect: () => openTerminal.mutate(project.id),
      },
      { kind: "separator", id: "sep-1" },
      {
        kind: "action",
        id: "edit",
        label: "Edit Project…",
        icon: <Pencil size={14} />,
        onSelect: () => setEditingProjectId(project.id),
      },
      {
        kind: "action",
        id: "hide",
        label: project.hidden ? "Unhide Project" : "Hide Project",
        icon: project.hidden ? <Eye size={14} /> : <EyeOff size={14} />,
        onSelect: () => hideProject.mutate({ id: project.id, hidden: !project.hidden }),
      },
      {
        kind: "action",
        id: "delete",
        label: "Delete Project",
        icon: <Trash2 size={14} />,
        destructive: true,
        onSelect: () => void handleDelete(),
      },
    ],
    [
      project.id,
      project.hidden,
      openFinder,
      openVsCode,
      openTerminal,
      hideProject,
      setEditingProjectId,
      handleDelete,
    ],
  );

  const handleContextMenu = (event: MouseEvent) => {
    open(event);
  };

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
      <button
        type="button"
        onClick={onSelect}
        onContextMenu={handleContextMenu}
        className="row"
        data-selected={selected}
      >
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

      <ContextMenu position={position} options={options} onClose={close} />
    </div>
  );
}
