import { useState, type ReactNode } from "react";
import { ArrowUpDown, Plus } from "lucide-react";
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
  const { reorderProjectCommands } = useCommandTemplateActions();
  const { runCommandTemplate } = useProjectActions();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isReordering, setReordering] = useState(false);

  const canReorder = projectId !== null && data.length > 1;

  const moveItemBy = (index: number, delta: number) => {
    if (!projectId) return;
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= data.length) return;
    const reordered = moveItem(data, index, targetIndex);
    reorderProjectCommands.mutate({
      projectId,
      templateIds: reordered.map((template) => template.id),
    });
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

      {data.length ? (
        <div className="space-y-1.5">
          {data.map((template, index) => {
            const editable = projectId === null || template.projectId === projectId;
            return (
              <CommandRow
                key={template.id}
                template={template}
                editable={editable}
                reordering={isReordering}
                canMoveUp={index > 0}
                canMoveDown={index < data.length - 1}
                onMoveUp={() => moveItemBy(index, -1)}
                onMoveDown={() => moveItemBy(index, 1)}
                onRun={() => runTemplate(template.id)}
              />
            );
          })}
        </div>
      ) : (
        <div
          className="rounded-[10px] border border-dashed px-3 py-3 text-center text-[12px]"
          style={{ borderColor: "var(--border-strong)", color: "var(--text-tertiary)" }}
        >
          No commands
        </div>
      )}

      <CreateCommandDialog
        open={isDialogOpen}
        projectId={projectId}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
