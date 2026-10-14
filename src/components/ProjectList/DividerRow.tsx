import { useMemo, type MouseEvent } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { cx } from "../../lib/cx";
import { useContextMenu } from "../../hooks/useContextMenu";
import { useDividerActions } from "../../hooks/useDividers";
import { useProjectUiStore } from "../../store/useProjectUiStore";
import type { Divider } from "../../lib/types";
import type { ContextMenuOption } from "../../lib/contextMenuTypes";
import { ContextMenu } from "../ContextMenu/ContextMenu";

type DividerRowProps = {
  divider: Divider;
  categoryId: string;
};

export function DividerRow({
  divider,
  categoryId,
}: DividerRowProps) {
  const setEditingDividerId = useProjectUiStore((state) => state.setEditingDividerId);
  const { deleteDivider } = useDividerActions(categoryId);
  const { position, open, close } = useContextMenu();

  const options = useMemo<ContextMenuOption[]>(
    () => [
      {
        kind: "action",
        id: "edit",
        label: divider.label ? "Edit Divider…" : "Add Label…",
        icon: <Pencil size={14} />,
        onSelect: () => setEditingDividerId(divider.id),
      },
      { kind: "separator", id: "sep-1" },
      {
        kind: "action",
        id: "delete",
        label: "Delete Divider",
        icon: <Trash2 size={14} />,
        destructive: true,
        onSelect: () => deleteDivider.mutate(divider.id),
      },
    ],
    [divider.id, divider.label, deleteDivider, setEditingDividerId],
  );

  const handleContextMenu = (event: MouseEvent) => {
    open(event);
  };

  return (
    <div className="relative">
      <div
        onContextMenu={handleContextMenu}
        onDoubleClick={() => setEditingDividerId(divider.id)}
        className={cx("list-divider", divider.label ? null : "list-divider-empty")}
      >
        {divider.label ? <span className="list-divider-label">{divider.label}</span> : null}
        <span className="list-divider-line" />
      </div>

      <ContextMenu position={position} options={options} onClose={close} />
    </div>
  );
}
