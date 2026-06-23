import { useMemo, useState } from "react";
import { ChevronRight, Trash2 } from "lucide-react";
import { useCategoryActions } from "../../hooks/useCategories";
import { sidebarColors } from "../../lib/constants";
import { filterIconNames, getCategoryIcon } from "../../lib/iconRegistry";
import type { Category } from "../../lib/types";

type CategoryMenuProps = {
  category: Category;
};

export function CategoryMenu({ category }: CategoryMenuProps) {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState(category.name);
  const [iconQuery, setIconQuery] = useState("");
  const [icon, setIcon] = useState(category.icon);
  const [color, setColor] = useState(category.color);
  const { updateCategory, hideCategory, deleteCategory } = useCategoryActions();
  const iconNames = useMemo(() => filterIconNames(iconQuery).slice(0, 8), [iconQuery]);

  const handleSave = () => {
    updateCategory.mutate({
      id: category.id,
      category: {
        name,
        icon,
        color,
        sortOrder: category.sortOrder,
        hidden: category.hidden,
      },
    });
  };

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="row"
      >
        <ChevronRight
          size={12}
          style={{
            color: "var(--text-tertiary)",
            transform: expanded ? "rotate(90deg)" : "none",
            transition: "transform 160ms var(--ease-out)",
          }}
        />
        <span className="min-w-0 flex-1 truncate text-[12px]" style={{ color: "var(--text-secondary)" }}>
          Edit {category.name}
        </span>
      </button>

      {expanded ? (
        <div className="mt-2 space-y-2 px-1">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="field"
            placeholder="Name"
          />
          <input
            value={iconQuery}
            onChange={(event) => setIconQuery(event.target.value)}
            className="field"
            placeholder="Search icons"
          />
          <div className="grid grid-cols-4 gap-1">
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
                  <Icon size={13} />
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-1.5">
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
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={handleSave} className="btn btn-primary flex-1">
              Save
            </button>
            <button
              type="button"
              onClick={() => hideCategory.mutate({ id: category.id, hidden: !category.hidden })}
              className="btn"
            >
              {category.hidden ? "Show" : "Hide"}
            </button>
            <button
              type="button"
              onClick={() => deleteCategory.mutate(category.id)}
              className="btn-icon btn-destructive"
              aria-label="Delete category"
              style={{ width: 28, height: 28 }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
