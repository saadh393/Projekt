import { useMemo, type MouseEvent } from "react";
import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
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
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSelect: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

export function CategoryItem({
  category,
  count,
  selected,
  reordering,
  canMoveUp,
  canMoveDown,
  onSelect,
  onMoveUp,
  onMoveDown,
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
    <div className="relative">
      <button
        type="button"
        onClick={reordering ? undefined : onSelect}
        onContextMenu={handleContextMenu}
        className="row"
        data-selected={selected}
        style={reordering ? { paddingRight: 58 } : undefined}
      >
        <span
          className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded"
          style={{ backgroundColor: category.color }}
        >
          <Icon size={11} color="#fff" strokeWidth={2.5} />
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px]">{category.name}</span>
        {!reordering ? (
          <span
            className="row-meta text-[11px] tabular-nums"
            style={{ color: selected ? "rgba(255,255,255,0.85)" : "var(--text-tertiary)" }}
          >
            {count}
          </span>
        ) : null}
      </button>

      {reordering ? (
        <div className="reorder-controls">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label={`Move ${category.name} up`}
            title="Move up"
          >
            <ChevronUp size={12} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label={`Move ${category.name} down`}
            title="Move down"
          >
            <ChevronDown size={12} />
          </button>
        </div>
      ) : null}

      <ContextMenu position={position} options={options} onClose={close} />
    </div>
  );
}
