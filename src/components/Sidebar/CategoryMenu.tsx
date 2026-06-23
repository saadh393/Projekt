import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { useCategoryActions } from "../../hooks/useCategories";
import { sidebarColors } from "../../lib/constants";
import { filterIconNames, getCategoryIcon } from "../../lib/iconRegistry";
import type { Category } from "../../lib/types";

type CategoryMenuProps = {
  category: Category;
};

export function CategoryMenu({ category }: CategoryMenuProps) {
  const [name, setName] = useState(category.name);
  const [iconQuery, setIconQuery] = useState("");
  const [icon, setIcon] = useState(category.icon);
  const [color, setColor] = useState(category.color);
  const { updateCategory, hideCategory, deleteCategory } = useCategoryActions();
  const iconNames = useMemo(() => filterIconNames(iconQuery).slice(0, 8), [iconQuery]);

  return (
    <details className="rounded-md border border-zinc-200 bg-white px-2 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-950">
      <summary className="cursor-pointer text-zinc-500">Edit {category.name}</summary>
      <div className="mt-3 space-y-3">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900"
          placeholder="Category name"
        />
        <input
          value={iconQuery}
          onChange={(event) => setIconQuery(event.target.value)}
          className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900"
          placeholder="Search icons"
        />
        <div className="grid grid-cols-4 gap-1">
          {iconNames.map((iconName) => {
            const Icon = getCategoryIcon(iconName);

            return (
              <button
                key={iconName}
                type="button"
                title={iconName}
                onClick={() => setIcon(iconName)}
                className="flex h-8 items-center justify-center rounded-md border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
              >
                <Icon size={15} className={icon === iconName ? "text-blue-600" : ""} />
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-1">
          {sidebarColors.map((option) => (
            <button
              key={option}
              type="button"
              aria-label={option}
              onClick={() => setColor(option)}
              className="h-5 w-5 rounded-full border border-black/10 ring-offset-2"
              style={{
                backgroundColor: option,
                boxShadow: color === option ? "0 0 0 2px #18181b" : undefined,
              }}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              updateCategory.mutate({
                id: category.id,
                category: {
                  name,
                  icon,
                  color,
                  sortOrder: category.sortOrder,
                  hidden: category.hidden,
                },
              })
            }
            className="rounded-md bg-zinc-900 px-2 py-1.5 text-white"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => hideCategory.mutate({ id: category.id, hidden: !category.hidden })}
            className="rounded-md border border-zinc-200 px-2 py-1.5 dark:border-zinc-800"
          >
            {category.hidden ? "Unhide" : "Hide"}
          </button>
          <button
            type="button"
            onClick={() => deleteCategory.mutate(category.id)}
            className="ml-auto rounded-md border border-red-200 px-2 py-1.5 text-red-600"
            aria-label="Delete category"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </details>
  );
}
