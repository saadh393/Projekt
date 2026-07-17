export const clampTerminalPanelHeight = (height: number, viewportHeight: number) =>
  Math.min(Math.max(height, 180), Math.max(180, viewportHeight - 120));
