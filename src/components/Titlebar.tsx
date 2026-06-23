import type { MouseEvent } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { canStartWindowDrag } from "../lib/windowDrag";

export function Titlebar() {
  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (!canStartWindowDrag(event.button)) {
      return;
    }

    void getCurrentWindow().startDragging();
  };

  return <div className="titlebar" data-tauri-drag-region onMouseDown={handleMouseDown} />;
}
