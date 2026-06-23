import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMountTransition } from "../../hooks/useMountTransition";
import type { ContextMenuOption, ContextMenuPosition } from "../../lib/contextMenuTypes";
import { ContextMenuItem } from "./ContextMenuItem";

type ContextMenuProps = {
  position: ContextMenuPosition | null;
  options: ContextMenuOption[];
  onClose: () => void;
};

export function ContextMenu({ position, options, onClose }: ContextMenuProps) {
  const isOpen = position !== null;
  const { render, state } = useMountTransition(isOpen, 160);
  const ref = useRef<HTMLDivElement | null>(null);
  const [adjusted, setAdjusted] = useState<ContextMenuPosition | null>(position);

  useLayoutEffect(() => {
    if (!position || !ref.current) {
      return;
    }

    const rect = ref.current.getBoundingClientRect();
    const margin = 8;
    const maxX = window.innerWidth - rect.width - margin;
    const maxY = window.innerHeight - rect.height - margin;
    setAdjusted({
      x: Math.max(margin, Math.min(position.x, maxX)),
      y: Math.max(margin, Math.min(position.y, maxY)),
    });
  }, [position]);

  useEffect(() => {
    if (!isOpen) return;

    const onMouseDown = (event: MouseEvent) => {
      if (ref.current?.contains(event.target as Node)) return;
      onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!render) {
    return null;
  }

  const point = adjusted ?? position ?? { x: 0, y: 0 };

  return createPortal(
    <div
      ref={ref}
      className="context-menu"
      data-state={state}
      style={{ top: point.y, left: point.x, transformOrigin: "top left" }}
      onContextMenu={(event) => event.preventDefault()}
    >
      {options.map((option) =>
        option.kind === "separator" ? (
          <div key={option.id} className="context-menu-separator" />
        ) : (
          <ContextMenuItem key={option.id} action={option} onSelect={onClose} />
        ),
      )}
    </div>,
    document.body,
  );
}
