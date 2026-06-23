import { useEffect } from "react";
import { useProjectUiStore } from "../store/useProjectUiStore";

export const useKeyboardShortcuts = () => {
  const setProjectSheetOpen = useProjectUiStore((state) => state.setProjectSheetOpen);
  const setSettingsOpen = useProjectUiStore((state) => state.setSettingsOpen);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.metaKey) {
        return;
      }

      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        setProjectSheetOpen(true);
      }

      if (event.key === ",") {
        event.preventDefault();
        setSettingsOpen(true);
      }

      if (event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder="Search projects"]')?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setProjectSheetOpen, setSettingsOpen]);
};
