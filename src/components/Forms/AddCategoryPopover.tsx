import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import { useCreateCategory } from "../../hooks/useCategories";
import { defaultCategoryIcon, sidebarColors } from "../../lib/constants";
import { filterIconNames, getCategoryIcon } from "../../lib/iconRegistry";
import { useMountTransition } from "../../hooks/useMountTransition";

type AddCategoryPopoverProps = {
  sortOrder: number;
};

type Position = { top: number; left: number };

export function AddCategoryPopover({ sortOrder }: AddCategoryPopoverProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(defaultCategoryIcon);
  const [iconQuery, setIconQuery] = useState("");
  const [color, setColor] = useState(sidebarColors[0]);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
  const createCategory = useCreateCategory();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLFormElement | null>(null);
  const { render, state } = useMountTransition(open, 180);
  const iconNames = useMemo(() => filterIconNames(iconQuery).slice(0, 10), [iconQuery]);

  useLayoutEffect(() => {
    if (!render) return;
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 6,
      left: Math.max(8, rect.right - 256),
    });
  }, [render]);

  useEffect(() => {
    if (!open) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
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
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="btn-icon"
        aria-label="Add category"
        title="Add category"
      >
        <Plus size={14} />
      </button>
      {render
        ? createPortal(
            <form
              ref={popoverRef}
              onSubmit={handleSubmit}
              className="popover-panel fixed w-64 space-y-2 p-3"
              data-state={state}
              style={{
                top: position.top,
                left: position.left,
                transformOrigin: "top right",
                zIndex: 80,
              }}
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
                      boxShadow:
                        color === option
                          ? "0 0 0 2px #fff, 0 0 0 3.5px var(--accent)"
                          : "inset 0 0 0 1px rgba(0,0,0,0.1)",
                    }}
                  />
                ))}
              </div>
              <button type="submit" className="btn btn-primary w-full">
                Add Category
              </button>
            </form>,
            document.body,
          )
        : null}
    </>
  );
}
