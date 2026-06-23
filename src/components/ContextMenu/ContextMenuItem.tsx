import { cx } from "../../lib/cx";
import type { ContextMenuAction } from "../../lib/contextMenuTypes";

type ContextMenuItemProps = {
  action: ContextMenuAction;
  onSelect: () => void;
};

export function ContextMenuItem({ action, onSelect }: ContextMenuItemProps) {
  return (
    <button
      type="button"
      onClick={() => {
        if (action.disabled) return;
        action.onSelect();
        onSelect();
      }}
      disabled={action.disabled}
      className={cx("context-menu-item", action.destructive && "destructive")}
    >
      {action.icon ? <span className="context-menu-icon">{action.icon}</span> : null}
      <span className="min-w-0 flex-1 truncate">{action.label}</span>
    </button>
  );
}
