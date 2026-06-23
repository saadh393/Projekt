import { useEffect, useState } from "react";

export function useMountTransition(isOpen: boolean, exitMs = 300) {
  const [render, setRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      return;
    }

    const timer = window.setTimeout(() => setRender(false), exitMs);
    return () => window.clearTimeout(timer);
  }, [isOpen, exitMs]);

  return {
    render,
    state: (isOpen ? "open" : "closed") as "open" | "closed",
  };
}
