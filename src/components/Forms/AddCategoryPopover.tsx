import { useMemo, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { useCreateCategory } from "../../hooks/useCategories";
import { defaultCategoryIcon, sidebarColors } from "../../lib/constants";
import { filterIconNames, getCategoryIcon } from "../../lib/iconRegistry";

type AddCategoryPopoverProps = {
  sortOrder: number;
};

export function AddCategoryPopover({ sortOrder }: AddCategoryPopoverProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(defaultCategoryIcon);
  const [iconQuery, setIconQuery] = useState("");
  const [color, setColor] = useState(sidebarColors[0]);
  const createCategory = useCreateCategory();
  const iconNames = useMemo(() => filterIconNames(iconQuery).slice(0, 10), [iconQuery]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    createCategory.mutate(
      { name: name.trim(), icon, color, sortOrder },
      {
        onSuccess: () => {
          setName("");
          setOpen(false);
        },
      },
    );
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/70 shadow-sm hover:bg-white dark:hover:bg-zinc-800"
        aria-label="Add category"
      >
        <Plus size={16} />
      </button>
      {open ? (
        <form
          onSubmit={handleSubmit}
          className="absolute left-0 top-10 z-20 w-64 origin-top-left space-y-3 rounded-2xl border border-white bg-white/95 p-3 shadow-2xl shadow-zinc-950/15 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950"
        >
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            placeholder="Category name"
          />
          <input
            value={iconQuery}
            onChange={(event) => setIconQuery(event.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-zinc-800 dark:bg-zinc-900"
            placeholder="Search icons"
          />
          <div className="grid grid-cols-5 gap-1">
            {iconNames.map((iconName) => {
              const Icon = getCategoryIcon(iconName);

              return (
                <button
                  key={iconName}
                  type="button"
                  title={iconName}
                  onClick={() => setIcon(iconName)}
                  className="flex h-8 items-center justify-center rounded-lg border border-zinc-200 hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  <Icon size={15} className={icon === iconName ? "text-blue-600" : ""} />
                </button>
              );
            })}
          </div>
          <div className="flex gap-1">
            {sidebarColors.map((option) => (
              <button
                key={option}
                type="button"
                aria-label={option}
                onClick={() => setColor(option)}
                className="h-5 w-5 rounded-full border border-black/10"
                style={{
                  backgroundColor: option,
                  boxShadow: color === option ? "0 0 0 2px #18181b" : undefined,
                }}
              />
            ))}
          </div>
          <button type="submit" className="w-full rounded-xl bg-zinc-950 px-3 py-2 text-sm text-white shadow-lg shadow-zinc-950/15">
            Save Category
          </button>
        </form>
      ) : null}
    </div>
  );
}
