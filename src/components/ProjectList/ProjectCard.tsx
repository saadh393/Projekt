import { useMemo, type MouseEvent } from "react";
import { confirm } from "@tauri-apps/plugin-dialog";
import {
  ChevronDown,
  ChevronUp,
  Code2,
  Eye,
  EyeOff,
  FolderOpen,
  Pencil,
  Terminal,
  Trash2,
  Wand2,
} from "lucide-react";
import { findCategoryName } from "../../lib/categoryUtils";
import { cx } from "../../lib/cx";
import { getDeleteProjectMessage } from "../../lib/projectDelete";
import type { Category, Project } from "../../lib/types";
import type { ContextMenuOption } from "../../lib/contextMenuTypes";
import { useContextMenu } from "../../hooks/useContextMenu";
import { useProjectActions } from "../../hooks/useProjects";
import { useProjectUiStore } from "../../store/useProjectUiStore";
import { ContextMenu } from "../ContextMenu/ContextMenu";

type ProjectCardProps = {
  project: Project;
  categories: Category[];
  selected: boolean;
  reordering: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

export function ProjectCard({
  project,
  categories,
  selected,
  reordering,
  canMoveUp,
  canMoveDown,
  onSelect,
  onMoveUp,
  onMoveDown,
}: ProjectCardProps) {
  const categoryName = findCategoryName(categories, project.categoryId);
  const setEditingProjectId = useProjectUiStore((state) => state.setEditingProjectId);
  const setSelectedProjectId = useProjectUiStore((state) => state.setSelectedProjectId);
  const { hideProject, deleteProject, openFinder, openVsCode, openAntigravity, openTerminal } = useProjectActions();
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
        id: "antigravity",
        label: "Open in Antigravity",
        icon: <Wand2 size={14} />,
        onSelect: () => openAntigravity.mutate(project.id),
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
      openAntigravity,
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
    <div className={cx("relative group", project.hidden ? "opacity-60" : "")}>
      <button
        type="button"
        onClick={reordering ? undefined : onSelect}
        onContextMenu={handleContextMenu}
        className="row"
        data-selected={selected}
        style={reordering ? { paddingRight: 58 } : undefined}
      >
        <span className="dot" style={{ backgroundColor: project.color }} />

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

        {!reordering ? (
          <div className="row-meta flex shrink-0 items-center gap-1.5">
            {project.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
            {categoryName ? <span className="chip">{categoryName}</span> : null}
          </div>
        ) : null}
      </button>

      {reordering ? (
        <div className="reorder-controls">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label={`Move ${project.name} up`}
            title="Move up"
          >
            <ChevronUp size={12} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label={`Move ${project.name} down`}
            title="Move down"
          >
            <ChevronDown size={12} />
          </button>
        </div>
      ) : null}

      <ContextMenu position={position} options={options} onClose={close} />
    </div>
  );
}
