import { useEffect, useState } from "react";

export function useMountTransition(isOpen: boolean, exitMs = 300) {
  const [render, setRender] = useState(isOpen);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRender(true);
      return;
    }

    setMounted(false);
    const timer = window.setTimeout(() => setRender(false), exitMs);
    return () => window.clearTimeout(timer);
  }, [isOpen, exitMs]);

  useEffect(() => {
    if (!render || mounted) {
      return;
    }

    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setMounted(true));
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
    };
  }, [render, mounted]);

  return { render, state: (mounted ? "open" : "closed") as "open" | "closed" };
}
