import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronUp, Play, Terminal, Trash2 } from "lucide-react";
import { useCommandTemplateActions } from "../../hooks/useCommandTemplates";
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
  onRun: () => void;
};

export function CommandRow({
  template,
  editable,
  reordering,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRun,
}: CommandRowProps) {
  const { updateCommandTemplate, deleteCommandTemplate } = useCommandTemplateActions();
  const [label, setLabel] = useState(template.label);
  const [command, setCommand] = useState(template.command);
  const [executionTarget, setExecutionTarget] = useState<CommandExecutionTarget>(
    template.executionTarget,
  );

  useEffect(() => {
    setLabel(template.label);
    setCommand(template.command);
    setExecutionTarget(template.executionTarget);
  }, [template.label, template.command, template.executionTarget]);

  const handleSave = () =>
    updateCommandTemplate.mutate({
      id: template.id,
      template: {
        label: label.trim(),
        command: command.trim(),
        projectId: template.projectId,
        executionTarget,
      },
    });

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

  if (!editable) {
    return (
      <div
        className="flex items-center gap-2 rounded-[10px] border bg-white p-2.5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[12px] font-medium">{template.label}</span>
            <span className="chip">Global</span>
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
        <button
          type="button"
          onClick={onRun}
          className="btn-icon"
          style={{ background: "var(--accent)", color: "#fff" }}
          aria-label={`Run ${template.label}`}
        >
          <Play size={11} fill="currentColor" />
        </button>
      </div>
    );
  }

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
            onClick={handleDelete}
            className="btn-icon btn-destructive"
            aria-label={`Delete ${template.label}`}
          >
            <Trash2 size={13} />
          </button>
          <button
            type="button"
            onClick={onRun}
            className="btn-icon"
            style={{ background: "var(--accent)", color: "#fff" }}
            aria-label={`Run ${template.label}`}
          >
            <Play size={11} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
