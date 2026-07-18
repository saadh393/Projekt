import { useMemo, useState, type ReactNode } from "react";
import { ArrowUpDown, Eye, EyeOff, Plus } from "lucide-react";
import {
  useCommandTemplateActions,
  useCommandTemplates,
} from "../../hooks/useCommandTemplates";
import { useProjectActions } from "../../hooks/useProjects";
import { moveItem } from "../../lib/reorder";
import { CommandRow } from "./CommandRow";
import { CreateCommandDialog } from "./CreateCommandDialog";

type CommandManagerProps = {
  projectId: string | null;
  title?: ReactNode;
  onCommandRun?: () => void;
};

export function CommandManager({ projectId, title, onCommandRun }: CommandManagerProps) {
  const { data = [] } = useCommandTemplates(projectId);
  const { reorderProjectCommands, setProjectCommandHidden } = useCommandTemplateActions();
  const { runCommandTemplate } = useProjectActions();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isReordering, setReordering] = useState(false);
  const [showHidden, setShowHidden] = useState(false);

  const hiddenCount = useMemo(
    () => data.filter((template) => template.hidden).length,
    [data],
  );
  const visibleCommands = showHidden ? data : data.filter((template) => !template.hidden);
  const canReorder = projectId !== null && visibleCommands.length > 1;

  const moveItemBy = (index: number, delta: number) => {
    if (!projectId) return;
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= visibleCommands.length) return;
    const reordered = moveItem(visibleCommands, index, targetIndex);
    reorderProjectCommands.mutate({
      projectId,
      templateIds: reordered.map((template) => template.id),
    });
  };

  const toggleHidden = (templateId: string, hidden: boolean) => {
    if (!projectId) return;
    setProjectCommandHidden.mutate({ projectId, templateId, hidden });
  };

  const runTemplate = (templateId: string) => {
    if (!projectId) return;
    runCommandTemplate.mutate({ projectId, templateId }, { onSuccess: onCommandRun });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        {title ?? <span />}
        <div className="flex items-center gap-1">
          {canReorder ? (
            <button
              type="button"
              onClick={() => setReordering((value) => !value)}
              className="btn-icon"
              aria-pressed={isReordering}
              aria-label={isReordering ? "Done reordering commands" : "Reorder commands"}
              title={isReordering ? "Done reordering" : "Reorder commands"}
              style={isReordering ? { background: "var(--accent)", color: "#fff" } : undefined}
            >
              <ArrowUpDown size={13} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            className="btn-icon"
            aria-label="Add command"
            title="Add command"
          >
            <Plus size={13} />
          </button>
        </div>
      </div>

      {data.length === 0 ? (
        <div
          className="rounded-[10px] border border-dashed px-3 py-3 text-center text-[12px]"
          style={{ borderColor: "var(--border-strong)", color: "var(--text-tertiary)" }}
        >
          No commands
        </div>
      ) : visibleCommands.length ? (
        <div className="space-y-1.5">
          {visibleCommands.map((template, index) => {
            const editable = projectId === null || template.projectId === projectId;
            const inProject = projectId !== null;
            return (
              <CommandRow
                key={template.id}
                template={template}
                editable={editable}
                reordering={isReordering}
                canMoveUp={index > 0}
                canMoveDown={index < visibleCommands.length - 1}
                onMoveUp={() => moveItemBy(index, -1)}
                onMoveDown={() => moveItemBy(index, 1)}
                onToggleHidden={
                  inProject ? () => toggleHidden(template.id, !template.hidden) : undefined
                }
                onRun={inProject ? () => runTemplate(template.id) : undefined}
              />
            );
          })}
        </div>
      ) : null}

      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setShowHidden((value) => !value)}
          className="flex items-center gap-1.5 px-1 text-[11px] font-medium"
          style={{ color: "var(--text-tertiary)" }}
        >
          {showHidden ? <EyeOff size={11} /> : <Eye size={11} />}
          {showHidden ? "Hide hidden commands" : `Show ${hiddenCount} hidden`}
        </button>
      ) : null}

      <CreateCommandDialog
        open={isDialogOpen}
        projectId={projectId}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
