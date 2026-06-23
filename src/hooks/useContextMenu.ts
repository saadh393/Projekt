import { useState, type MouseEvent } from "react";
import type { ContextMenuPosition } from "../lib/contextMenuTypes";

export function useContextMenu() {
  const [position, setPosition] = useState<ContextMenuPosition | null>(null);

  const open = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setPosition({ x: event.clientX, y: event.clientY });
  };

  const close = () => setPosition(null);

  return { position, open, close };
}
