import { EyeOff } from "lucide-react";
import { getCategoryIcon } from "../../lib/iconRegistry";
import { cx } from "../../lib/cx";
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
    <button
      type="button"
      onClick={onSelect}
      className={cx(
        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition",
        selected
          ? "bg-zinc-950 text-white shadow-sm shadow-zinc-950/20"
          : "text-zinc-700 hover:bg-white/75 hover:shadow-sm dark:text-zinc-200 dark:hover:bg-zinc-800",
      )}
    >
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
        style={{ backgroundColor: category.color, boxShadow: `0 8px 18px ${category.color}33` }}
      >
        <Icon size={15} />
      </span>
      <span className="min-w-0 flex-1 truncate">{category.name}</span>
      {category.hidden ? <EyeOff size={13} /> : null}
      <span className="text-xs opacity-60">{count}</span>
    </button>
  );
}
