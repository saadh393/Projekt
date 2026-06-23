import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { useCreateCategory } from "../../hooks/useCategories";
import { defaultCategoryIcon, sidebarColors } from "../../lib/constants";
import { filterIconNames, getCategoryIcon } from "../../lib/iconRegistry";

type AddCategoryPopoverProps = {
  sortOrder: number;
};

export function AddCategoryPopover({ sortOrder }: AddCategoryPopoverProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(defaultCategoryIcon);
  const [iconQuery, setIconQuery] = useState("");
  const [color, setColor] = useState(sidebarColors[0]);
  const createCategory = useCreateCategory();
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const iconNames = useMemo(() => filterIconNames(iconQuery).slice(0, 10), [iconQuery]);

  useEffect(() => {
    if (open) {
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }
    setMounted(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

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
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="btn-icon"
        aria-label="Add category"
      >
        <Plus size={14} />
      </button>
      {open ? (
        <form
          onSubmit={handleSubmit}
          className="popover-panel absolute left-0 top-8 z-30 w-64 space-y-2 p-3"
          data-state={mounted ? "open" : "closed"}
        >
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="field"
            placeholder="Category name"
            autoFocus
          />
          <input
            value={iconQuery}
            onChange={(event) => setIconQuery(event.target.value)}
            className="field"
            placeholder="Search icons"
          />
          <div className="grid grid-cols-5 gap-1">
            {iconNames.map((iconName) => {
              const Icon = getCategoryIcon(iconName);
              const active = icon === iconName;

              return (
                <button
                  key={iconName}
                  type="button"
                  title={iconName}
                  onClick={() => setIcon(iconName)}
                  className="flex h-7 items-center justify-center rounded"
                  style={{
                    background: active ? "var(--accent-soft)" : "transparent",
                    color: active ? "var(--accent)" : "var(--text-secondary)",
                  }}
                >
                  <Icon size={14} />
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {sidebarColors.map((option) => (
              <button
                key={option}
                type="button"
                aria-label={option}
                onClick={() => setColor(option)}
                className="h-4 w-4 rounded-full"
                style={{
                  backgroundColor: option,
                  boxShadow: color === option ? "0 0 0 2px #fff, 0 0 0 3.5px var(--accent)" : "inset 0 0 0 1px rgba(0,0,0,0.1)",
                }}
              />
            ))}
          </div>
          <button type="submit" className="btn btn-primary w-full">
            Add Category
          </button>
        </form>
      ) : null}
    </div>
  );
}
