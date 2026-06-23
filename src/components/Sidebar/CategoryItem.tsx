import { EyeOff } from "lucide-react";
import { getCategoryIcon } from "../../lib/iconRegistry";
import type { Category } from "../../lib/types";

type CategoryItemProps = {
  category: Category;
  count: number;
  selected: boolean;
  onSelect: () => void;
};

export function CategoryItem({ category, count, selected, onSelect }: CategoryItemProps) {
  const Icon = getCategoryIcon(category.icon);

  return (
    <button type="button" onClick={onSelect} className="row" data-selected={selected}>
      <span
        className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded"
        style={{ backgroundColor: category.color }}
      >
        <Icon size={11} color="#fff" strokeWidth={2.5} />
      </span>
      <span className="min-w-0 flex-1 truncate text-[13px]">{category.name}</span>
      {category.hidden ? <EyeOff size={12} className="row-meta" style={{ color: "var(--text-tertiary)" }} /> : null}
      <span
        className="row-meta text-[11px] tabular-nums"
        style={{ color: selected ? "rgba(255,255,255,0.85)" : "var(--text-tertiary)" }}
      >
        {count}
      </span>
    </button>
  );
}
