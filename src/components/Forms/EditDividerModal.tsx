import { useEffect, useMemo, useState } from "react";
import { Trash2, X } from "lucide-react";
import { useDividerActions } from "../../hooks/useDividers";
import { useMountTransition } from "../../hooks/useMountTransition";
import { useProjectUiStore } from "../../store/useProjectUiStore";
import { allProjectsCategoryId } from "../../lib/constants";
import type { Divider } from "../../lib/types";

type EditDividerModalProps = {
  dividers: Divider[];
};

export function EditDividerModal({ dividers }: EditDividerModalProps) {
  const editingId = useProjectUiStore((state) => state.editingDividerId);
  const setEditingId = useProjectUiStore((state) => state.setEditingDividerId);
  const divider = useMemo(
    () => dividers.find((entry) => entry.id === editingId) ?? null,
    [dividers, editingId],
  );
  const categoryKey = divider?.categoryId ?? allProjectsCategoryId;
  const { render, state } = useMountTransition(Boolean(divider), 240);
  const { updateDivider, deleteDivider } = useDividerActions(categoryKey);

  const [label, setLabel] = useState("");

  useEffect(() => {
    if (divider) {
      setLabel(divider.label ?? "");
    }
  }, [divider?.id]);

  const close = () => setEditingId(null);

  const handleSave = () => {
    if (!divider) return;
    const trimmed = label.trim();
    updateDivider.mutate(
      {
        id: divider.id,
        divider: {
          label: trimmed.length ? trimmed : null,
          categoryId: divider.categoryId,
        },
      },
      { onSuccess: close },
    );
  };

  const handleDelete = () => {
    if (!divider) return;
    deleteDivider.mutate(divider.id, { onSuccess: close });
  };

  if (!render || !divider) {
    return null;
  }

  return (
    <div className="modal-backdrop" data-state={state} onClick={close}>
      <section
        className="modal-panel w-[420px] max-w-[90vw]"
        data-state={state}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="relative flex items-center justify-center border-b"
          style={{ borderColor: "var(--border-divider)", height: 44 }}
        >
          <h2 className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
            Edit Divider
          </h2>
          <button type="button" onClick={close} className="btn-icon absolute right-2" aria-label="Close">
            <X size={13} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="space-y-1.5">
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
              placeholder="Leave blank for an unlabeled line"
              autoFocus
              onKeyDown={(event) => {
                if (event.key === "Enter") handleSave();
              }}
            />
            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              An empty label renders as a thin separator line.
            </p>
          </div>
        </div>

        <div
          className="flex items-center justify-between gap-2 border-t px-5 py-3"
          style={{ borderColor: "var(--border-divider)" }}
        >
          <button type="button" onClick={handleDelete} className="btn btn-destructive">
            <Trash2 size={13} />
            Delete
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={close} className="btn">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="btn btn-primary">
              Save
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
