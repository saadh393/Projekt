import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

type SortableRowProps = {
  id: string;
  disabled?: boolean;
  children: ReactNode;
};

export function SortableRow({ id, disabled = false, children }: SortableRowProps) {
  const { setNodeRef, setActivatorNodeRef, listeners, transform, transition, isDragging } =
    useSortable({ id, disabled });

  return (
    <div
      ref={setNodeRef}
      className="sortable-row"
      data-dragging={isDragging}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      {disabled ? null : (
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...listeners}
          className="drag-handle"
          aria-label="Drag to reorder"
          title="Drag to reorder"
        >
          <GripVertical size={14} />
        </button>
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
