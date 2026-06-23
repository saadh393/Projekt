import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { useMountTransition } from "../../hooks/useMountTransition";
import type { ContextMenuOption } from "../../lib/contextMenuTypes";
import { ContextMenuItem } from "../ContextMenu/ContextMenuItem";

type OverflowMenuProps = {
  options: ContextMenuOption[];
  label?: string;
};

type Position = { top: number; left: number };

export function OverflowMenu({ options, label = "More" }: OverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { render, state } = useMountTransition(open, 160);
  const [position, setPosition] = useState<Position>({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!render || !triggerRef.current) return;
    const trigger = triggerRef.current;
    const rect = trigger.getBoundingClientRect();
    const menuWidth = menuRef.current?.offsetWidth ?? 200;
    const margin = 8;
    const left = Math.max(margin, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - margin));
    setPosition({ top: rect.bottom + 6, left });
  }, [render]);

  useEffect(() => {
    if (!open) return;

    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="btn"
        aria-label={label}
        title={label}
        style={{ width: 36, padding: 0 }}
      >
        <MoreHorizontal size={14} />
      </button>
      {render
        ? createPortal(
            <div
              ref={menuRef}
              className="context-menu"
              data-state={state}
              style={{ top: position.top, left: position.left, transformOrigin: "top right" }}
            >
              {options.map((option) =>
                option.kind === "separator" ? (
                  <div key={option.id} className="context-menu-separator" />
                ) : (
                  <ContextMenuItem key={option.id} action={option} onSelect={() => setOpen(false)} />
                ),
              )}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
