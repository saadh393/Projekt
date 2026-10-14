export const terminalPanelMinHeight = 180;
export const workspaceReservedHeight = 240;

export const clampTerminalPanelHeight = (height: number, viewportHeight: number) =>
  Math.min(
    Math.max(height, terminalPanelMinHeight),
    Math.max(terminalPanelMinHeight, viewportHeight - workspaceReservedHeight),
  );
