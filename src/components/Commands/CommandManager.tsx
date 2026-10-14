import { useMemo, useState, type ReactNode } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import { confirm } from "@tauri-apps/plugin-dialog";
import { ArrowUpDown, Check, Eye, EyeOff, Library, Plus } from "lucide-react";
import {
  useCommandTemplateActions,
  useCommandTemplates,
} from "../../hooks/useCommandTemplates";
import { useProjectActions } from "../../hooks/useProjects";
import type { CommandTemplate, CommandValues } from "../../lib/types";
import { CommandRow } from "./CommandRow";
import { CreateCommandDialog } from "./CreateCommandDialog";
import { InheritCommandsDialog } from "./InheritCommandsDialog";
import { SortableList } from "../Sortable/SortableList";
import { SortableRow } from "../Sortable/SortableRow";

type CommandManagerProps = {
  projectId: string | null;
  title?: ReactNode;
  onCommandRun?: () => void;
};

export function CommandManager({ projectId, title, onCommandRun }: CommandManagerProps) {
  const { data = [] } = useCommandTemplates(projectId);
  const {
    reorderProjectCommands,
    setProjectCommandHidden,
    updateCommandTemplate,
    deleteCommandTemplate,
    unlinkGlobalCommand,
    overrideProjectCommand,
    resetProjectCommandOverride,
  } = useCommandTemplateActions();
  const { runCommandTemplate } = useProjectActions();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isInheritOpen, setInheritOpen] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [isReordering, setReordering] = useState(false);

  const hiddenCount = useMemo(
    () => data.filter((template) => template.hidden).length,
    [data],
  );
  const visibleCommands = showHidden ? data : data.filter((template) => !template.hidden);
  const canReorder = projectId !== null && visibleCommands.length > 1;

  const reorderCommands = (activeId: string, overId: string) => {
    if (!projectId) return;
    const ids = data.map((template) => template.id);
    reorderProjectCommands.mutate({
      projectId,
      templateIds: arrayMove(ids, ids.indexOf(activeId), ids.indexOf(overId)),
    });
  };

  const saveCommand = (template: CommandTemplate, values: CommandValues) =>
    projectId && template.inherited
      ? overrideProjectCommand.mutateAsync({ projectId, templateId: template.id, values })
      : updateCommandTemplate.mutateAsync({
          id: template.id,
          template: { ...values, projectId: template.projectId },
        });

  const removeCommand = async (template: CommandTemplate) => {
    if (projectId && template.inherited) {
      unlinkGlobalCommand.mutate({ projectId, templateId: template.id });
      return;
    }

    const confirmed = await confirm(
      projectId
        ? `Delete "${template.label}" from this project?`
        : `Delete "${template.label}"? It will be removed from every project that uses it.`,
      { title: "Delete Command", kind: "warning", okLabel: "Delete", cancelLabel: "Cancel" },
    );
    if (confirmed) {
      deleteCommandTemplate.mutate(template.id);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        {title ?? <span />}
        <div className="flex items-center gap-1">
          {isReordering ? (
            <button
              type="button"
              onClick={() => setReordering(false)}
              className="btn btn-primary"
            >
              <Check size={13} />
              Done
            </button>
          ) : (
            <>
              {canReorder ? (
                <button
                  type="button"
                  onClick={() => setReordering(true)}
                  className="btn"
                  title="Drag and drop to reorder"
                >
                  <ArrowUpDown size={13} />
                  Reorder
                </button>
              ) : null}
              {projectId ? (
                <button
                  type="button"
                  onClick={() => setInheritOpen(true)}
                  className="btn-icon"
                  aria-label="Add from global commands"
                  title="Add from global commands"
                >
                  <Library size={13} />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                className="btn-icon"
                aria-label="New command"
                title="New command"
              >
                <Plus size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {data.length === 0 ? (
        <div
          className="rounded-[10px] border border-dashed px-3 py-3 text-center text-[12px]"
          style={{ borderColor: "var(--border-strong)", color: "var(--text-tertiary)" }}
        >
          {projectId ? "No commands yet. Create one or add from Global Commands." : "No commands"}
        </div>
      ) : visibleCommands.length ? (
        <SortableList
          ids={visibleCommands.map((template) => template.id)}
          onReorder={reorderCommands}
        >
          <div className="space-y-1.5">
            {visibleCommands.map((template) => (
              <SortableRow key={template.id} id={template.id} disabled={!isReordering}>
                <CommandRow
                  template={template}
                  onSave={(values) => saveCommand(template, values)}
                  onRemove={() => void removeCommand(template)}
                  onReset={
                    projectId && template.inherited
                      ? () =>
                          resetProjectCommandOverride.mutate({
                            projectId,
                            templateId: template.id,
                          })
                      : undefined
                  }
                  onToggleHidden={
                    projectId
                      ? () =>
                          setProjectCommandHidden.mutate({
                            projectId,
                            templateId: template.id,
                            hidden: !template.hidden,
                          })
                      : undefined
                  }
                  onRun={
                    projectId
                      ? () =>
                          runCommandTemplate.mutate(
                            { projectId, templateId: template.id },
                            { onSuccess: onCommandRun },
                          )
                      : undefined
                  }
                />
              </SortableRow>
            ))}
          </div>
        </SortableList>
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
      {projectId ? (
        <InheritCommandsDialog
          open={isInheritOpen}
          projectId={projectId}
          linkedIds={data.filter((template) => template.inherited).map((template) => template.id)}
          onClose={() => setInheritOpen(false)}
        />
      ) : null}
    </div>
  );
}
