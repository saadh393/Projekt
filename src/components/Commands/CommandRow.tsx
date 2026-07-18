import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Pencil,
  Play,
  Terminal,
  Trash2,
  X,
} from "lucide-react";
import { useCommandTemplateActions } from "../../hooks/useCommandTemplates";
import { cx } from "../../lib/cx";
import type {
  CommandExecutionTarget,
  CommandTemplate,
} from "../../lib/types";

type CommandRowProps = {
  template: CommandTemplate;
  editable: boolean;
  reordering: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onToggleHidden?: () => void;
  onRun?: () => void;
};

export function CommandRow({
  template,
  editable,
  reordering,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onToggleHidden,
  onRun,
}: CommandRowProps) {
  const { updateCommandTemplate, deleteCommandTemplate } = useCommandTemplateActions();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(template.label);
  const [command, setCommand] = useState(template.command);
  const [executionTarget, setExecutionTarget] = useState<CommandExecutionTarget>(
    template.executionTarget,
  );

  useEffect(() => {
    if (!isEditing) {
      setLabel(template.label);
      setCommand(template.command);
      setExecutionTarget(template.executionTarget);
    }
  }, [
    template.label,
    template.command,
    template.executionTarget,
    isEditing,
  ]);

  const startEdit = () => {
    setLabel(template.label);
    setCommand(template.command);
    setExecutionTarget(template.executionTarget);
    setIsEditing(true);
  };

  const cancelEdit = () => setIsEditing(false);

  const handleSave = () =>
    updateCommandTemplate.mutate(
      {
        id: template.id,
        template: {
          label: label.trim(),
          command: command.trim(),
          projectId: template.projectId,
          executionTarget,
        },
      },
      { onSuccess: () => setIsEditing(false) },
    );

  const handleDelete = () => deleteCommandTemplate.mutate(template.id);

  if (reordering) {
    return (
      <div
        className="relative rounded-[10px] border bg-white p-2.5"
        style={{ borderColor: "var(--border-subtle)", paddingRight: 58 }}
      >
        <div className="flex items-center gap-2">
          <Terminal size={13} style={{ color: "var(--text-tertiary)" }} />
          <span className="truncate text-[12px] font-medium">{template.label}</span>
          {!template.projectId ? <span className="chip">Global</span> : null}
        </div>
        <div
          className="truncate font-mono text-[11px]"
          style={{ color: "var(--text-tertiary)" }}
        >
          {template.command}
        </div>
        <div className="reorder-controls">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label={`Move ${template.label} up`}
            title="Move up"
          >
            <ChevronUp size={12} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label={`Move ${template.label} down`}
            title="Move down"
          >
            <ChevronDown size={12} />
          </button>
        </div>
      </div>
    );
  }

  if (isEditing && editable) {
    return (
      <div
        className="rounded-[10px] border bg-white p-2.5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Terminal size={13} style={{ color: "var(--text-tertiary)" }} />
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="field flex-1"
              autoFocus
            />
          </div>
          <input
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            className="field field-mono"
          />
          <div className="flex items-center gap-2">
            <select
              value={executionTarget}
              onChange={(event) =>
                setExecutionTarget(event.target.value as CommandExecutionTarget)
              }
              className="field flex-1 appearance-none pr-7"
              aria-label={`Execution target for ${template.label}`}
            >
              <option value="external">OS terminal</option>
              <option value="embedded">Inner terminal</option>
            </select>
            <button
              type="button"
              onClick={handleSave}
              className="btn-icon"
              aria-label={`Save ${template.label}`}
              style={{ color: "#16a34a" }}
            >
              <Check size={13} />
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="btn-icon"
              aria-label={`Cancel editing ${template.label}`}
            >
              <X size={13} />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="btn-icon btn-destructive"
              aria-label={`Delete ${template.label}`}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx(
        "flex items-center gap-2 rounded-[10px] border bg-white p-2.5",
        template.hidden ? "opacity-50" : null,
      )}
      style={{ borderColor: "var(--border-subtle)" }}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[12px] font-medium">{template.label}</span>
          {!template.projectId ? <span className="chip">Global</span> : null}
          <span className="chip">
            {template.executionTarget === "embedded" ? "Inner" : "OS"}
          </span>
        </div>
        <div
          className="truncate font-mono text-[11px]"
          style={{ color: "var(--text-tertiary)" }}
        >
          {template.command}
        </div>
      </div>
      {onToggleHidden ? (
        <button
          type="button"
          onClick={onToggleHidden}
          className="btn-icon"
          aria-label={template.hidden ? `Unhide ${template.label}` : `Hide ${template.label}`}
          title={template.hidden ? "Unhide" : "Hide"}
        >
          {template.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
        </button>
      ) : null}
      {editable ? (
        <button
          type="button"
          onClick={startEdit}
          className="btn-icon"
          aria-label={`Edit ${template.label}`}
          title="Edit"
        >
          <Pencil size={13} />
        </button>
      ) : null}
      {onRun ? (
        <button
          type="button"
          onClick={onRun}
          className="btn-icon"
          style={{ background: "var(--accent)", color: "#fff" }}
          aria-label={`Run ${template.label}`}
          title="Run"
        >
          <Play size={11} fill="currentColor" />
        </button>
      ) : null}
    </div>
  );
}
