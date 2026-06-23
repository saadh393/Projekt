import { useMemo, type MouseEvent } from "react";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { getCategoryIcon } from "../../lib/iconRegistry";
import { useCategoryActions } from "../../hooks/useCategories";
import { useContextMenu } from "../../hooks/useContextMenu";
import { useProjectUiStore } from "../../store/useProjectUiStore";
import type { Category } from "../../lib/types";
import type { ContextMenuOption } from "../../lib/contextMenuTypes";
import { ContextMenu } from "../ContextMenu/ContextMenu";

type CategoryItemProps = {
  category: Category;
  count: number;
  selected: boolean;
  reordering: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
};

export function CategoryItem({
  category,
  count,
  selected,
  reordering,
  onSelect,
  onDragStart,
  onDragOver,
  onDrop,
}: CategoryItemProps) {
  const Icon = getCategoryIcon(category.icon);
  const { deleteCategory } = useCategoryActions();
  const setEditingCategoryId = useProjectUiStore((state) => state.setEditingCategoryId);
  const { position, open, close } = useContextMenu();

  const options = useMemo<ContextMenuOption[]>(
    () => [
      {
        kind: "action",
        id: "edit",
        label: "Edit Category…",
        icon: <Pencil size={14} />,
        onSelect: () => setEditingCategoryId(category.id),
      },
      { kind: "separator", id: "sep-1" },
      {
        kind: "action",
        id: "delete",
        label: "Delete Category",
        icon: <Trash2 size={14} />,
        destructive: true,
        onSelect: () => deleteCategory.mutate(category.id),
      },
    ],
    [category.id, deleteCategory, setEditingCategoryId],
  );

  const handleContextMenu = (event: MouseEvent) => {
    open(event);
  };

  return (
    <div
      draggable={reordering}
      onDragStart={onDragStart}
      onDragOver={(event) => {
        if (!reordering) return;
        event.preventDefault();
        onDragOver();
      }}
      onDrop={(event) => {
        if (!reordering) return;
        event.preventDefault();
        onDrop();
      }}
    >
      <button
        type="button"
        onClick={reordering ? undefined : onSelect}
        onContextMenu={handleContextMenu}
        className="row"
        data-selected={selected}
      >
        {reordering ? (
          <GripVertical
            size={12}
            style={{ color: selected ? "rgba(255,255,255,0.7)" : "var(--text-tertiary)" }}
            className="cursor-grab"
          />
        ) : (
          <span
            className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded"
            style={{ backgroundColor: category.color }}
          >
            <Icon size={11} color="#fff" strokeWidth={2.5} />
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-[13px]">{category.name}</span>
        <span
          className="row-meta text-[11px] tabular-nums"
          style={{ color: selected ? "rgba(255,255,255,0.85)" : "var(--text-tertiary)" }}
        >
          {count}
        </span>
      </button>

      <ContextMenu position={position} options={options} onClose={close} />
    </div>
  );
}
