import { useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  Pencil,
  Play,
  RotateCcw,
  Terminal,
  Trash2,
  Unlink,
  X,
} from "lucide-react";
import { cx } from "../../lib/cx";
import type { CommandExecutionTarget, CommandTemplate, CommandValues } from "../../lib/types";

type CommandRowProps = {
  template: CommandTemplate;
  onSave: (values: CommandValues) => Promise<unknown>;
  onRemove: () => void;
  onReset?: () => void;
  onToggleHidden?: () => void;
  onRun?: () => void;
};

export function CommandRow({
  template,
  onSave,
  onRemove,
  onReset,
  onToggleHidden,
  onRun,
}: CommandRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [label, setLabel] = useState(template.label);
  const [command, setCommand] = useState(template.command);
  const [executionTarget, setExecutionTarget] = useState<CommandExecutionTarget>(
    template.executionTarget,
  );
  const canSave = Boolean(label.trim() && command.trim()) && !isSaving;
  const removeLabel = template.inherited ? "Remove from project" : "Delete";

  const startEdit = () => {
    setLabel(template.label);
    setCommand(template.command);
    setExecutionTarget(template.executionTarget);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!canSave) return;
    setIsSaving(true);
    onSave({ label: label.trim(), command: command.trim(), executionTarget })
      .then(() => setIsEditing(false))
      .catch((error) => console.error("Failed to save command", error))
      .finally(() => setIsSaving(false));
  };

  if (isEditing) {
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
              onKeyDown={(event) => event.key === "Enter" && handleSave()}
              className="field flex-1"
              aria-label="Command label"
              autoFocus
            />
          </div>
          <input
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleSave()}
            className="field field-mono"
            aria-label="Command"
          />
          {template.inherited ? (
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              Changes apply to this project only. The global command stays unchanged.
            </p>
          ) : null}
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
              disabled={!canSave}
              className="btn-icon"
              aria-label={`Save ${template.label}`}
              title="Save"
              style={{ color: "#16a34a" }}
            >
              <Check size={13} />
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="btn-icon"
              aria-label={`Cancel editing ${template.label}`}
              title="Cancel"
            >
              <X size={13} />
            </button>
            {template.overridden && onReset ? (
              <button
                type="button"
                onClick={() => {
                  onReset();
                  setIsEditing(false);
                }}
                className="btn-icon"
                aria-label={`Reset ${template.label} to global`}
                title="Reset to global"
              >
                <RotateCcw size={13} />
              </button>
            ) : null}
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
          {template.overridden ? <span className="chip">Edited</span> : null}
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
      <button
        type="button"
        onClick={startEdit}
        className="btn-icon"
        aria-label={`Edit ${template.label}`}
        title="Edit"
      >
        <Pencil size={13} />
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="btn-icon btn-destructive"
        aria-label={`${removeLabel} ${template.label}`}
        title={removeLabel}
      >
        {template.inherited ? <Unlink size={13} /> : <Trash2 size={13} />}
      </button>
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
