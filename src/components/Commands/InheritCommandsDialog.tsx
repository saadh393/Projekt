import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useCommandTemplateActions, useCommandTemplates } from "../../hooks/useCommandTemplates";
import { useMountTransition } from "../../hooks/useMountTransition";

type InheritCommandsDialogProps = {
  open: boolean;
  projectId: string;
  linkedIds: string[];
  onClose: () => void;
};

export function InheritCommandsDialog({
  open,
  projectId,
  linkedIds,
  onClose,
}: InheritCommandsDialogProps) {
  const { render, state } = useMountTransition(open, 240);
  const { data: globals = [], isPending } = useCommandTemplates(null);
  const { linkGlobalCommands } = useCommandTemplateActions();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const available = globals.filter((template) => !linkedIds.includes(template.id));

  useEffect(() => {
    if (open) {
      setSelectedIds([]);
    }
  }, [open]);

  if (!render) {
    return null;
  }

  const toggle = (id: string) =>
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id],
    );

  const submit = () => {
    if (!selectedIds.length) return;
    linkGlobalCommands.mutate({ projectId, templateIds: selectedIds }, { onSuccess: onClose });
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
            Add from Global Commands
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

        <div className="max-h-[50vh] space-y-1.5 overflow-y-auto px-5 py-4">
          {isPending ? null : available.length ? (
            available.map((template) => (
              <label
                key={template.id}
                className="flex cursor-default items-center gap-2.5 rounded-[10px] border bg-white p-2.5"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(template.id)}
                  onChange={() => toggle(template.id)}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-medium">{template.label}</div>
                  <div
                    className="truncate font-mono text-[11px]"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {template.command}
                  </div>
                </div>
              </label>
            ))
          ) : (
            <p className="py-3 text-center text-[12px]" style={{ color: "var(--text-tertiary)" }}>
              {globals.length
                ? "This project already uses every global command."
                : "No global commands yet. Create them in Settings → Commands."}
            </p>
          )}
        </div>

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
            disabled={!selectedIds.length || linkGlobalCommands.isPending}
          >
            {selectedIds.length > 1 ? `Add ${selectedIds.length} Commands` : "Add Command"}
          </button>
        </div>
      </section>
    </div>
  );
}
