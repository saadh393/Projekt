import { useEffect, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useCommandTemplateActions } from "../../hooks/useCommandTemplates";
import { useMountTransition } from "../../hooks/useMountTransition";
import type { CommandExecutionTarget } from "../../lib/types";

type CreateCommandDialogProps = {
  open: boolean;
  projectId: string | null;
  onClose: () => void;
};

export function CreateCommandDialog({
  open,
  projectId,
  onClose,
}: CreateCommandDialogProps) {
  const { render, state } = useMountTransition(open, 240);
  const { createCommandTemplate } = useCommandTemplateActions();
  const [label, setLabel] = useState("");
  const [command, setCommand] = useState("");
  const [executionTarget, setExecutionTarget] =
    useState<CommandExecutionTarget>("external");

  useEffect(() => {
    if (open) {
      setLabel("");
      setCommand("");
      setExecutionTarget("external");
    }
  }, [open]);

  if (!render) {
    return null;
  }

  const submit = () => {
    if (!label.trim() || !command.trim()) return;

    createCommandTemplate.mutate(
      {
        label: label.trim(),
        command: command.trim(),
        projectId,
        executionTarget,
      },
      { onSuccess: onClose },
    );
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit();
  };

  return (
    <div className="modal-backdrop" data-state={state} onClick={onClose}>
      <section
        className="modal-panel w-[440px] max-w-[90vw]"
        data-state={state}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="relative flex items-center justify-center border-b"
          style={{ borderColor: "var(--border-divider)", height: 44 }}
        >
          <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
            {projectId ? "New Project Command" : "New Global Command"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon absolute right-2"
            aria-label="Close"
          >
            <X size={13} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          <label className="block space-y-1.5">
            <span
              className="block text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Label
            </span>
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="field"
              placeholder={projectId ? "Project command label" : "Global command label"}
              autoFocus
            />
          </label>

          <label className="block space-y-1.5">
            <span
              className="block text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Command
            </span>
            <input
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              className="field field-mono"
              placeholder="npm run dev"
            />
          </label>

          <label className="block space-y-1.5">
            <span
              className="block text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-tertiary)" }}
            >
              Run in
            </span>
            <select
              value={executionTarget}
              onChange={(event) =>
                setExecutionTarget(event.target.value as CommandExecutionTarget)
              }
              className="field appearance-none pr-7"
            >
              <option value="external">OS terminal</option>
              <option value="embedded">Inner terminal</option>
            </select>
          </label>
        </form>

        <div
          className="flex items-center justify-end gap-2 border-t px-5 py-3"
          style={{ borderColor: "var(--border-divider)" }}
        >
          <button type="button" onClick={onClose} className="btn">
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="btn btn-primary"
            disabled={!label.trim() || !command.trim()}
          >
            Add Command
          </button>
        </div>
      </section>
    </div>
  );
}
