import { useEffect } from "react";

export function useDisableContextMenu() {
  useEffect(() => {
    const handler = (event: MouseEvent) => event.preventDefault();
    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }, []);
}
