import type { ProjectDraft, ShellPreference, SortMode, TerminalPreference } from "./types";

export const allProjectsCategoryId = "all";

export const sidebarColors = [
  "#f97316",
  "#0f766e",
  "#2563eb",
  "#7c3aed",
  "#e11d48",
  "#15803d",
  "#ca8a04",
  "#475569",
];

export const projectAccentColors = [
  "#f97316",
  "#14b8a6",
  "#2563eb",
  "#7c3aed",
  "#e11d48",
  "#16a34a",
  "#ca8a04",
  "#64748b",
];

export const sortLabels: Record<SortMode, string> = {
  manual: "Manual",
  name: "Name A-Z",
  createdAt: "Date Added",
  lastOpenedAt: "Last Opened",
};

export const terminalLabels: Record<TerminalPreference, string> = {
  terminal: "Terminal.app",
  iterm2: "iTerm2",
  warp: "Warp",
};

export const shellLabels: Record<ShellPreference, string> = {
  bash: "Bash",
  zsh: "Zsh",
  powershell: "PowerShell",
  cmd: "Command Prompt",
};

export const defaultCategoryIcon = "briefcase";

export const emptyProjectDraft: ProjectDraft = {
  name: "",
  description: "",
  path: "",
  categoryId: null,
  color: "#2563eb",
  tags: [],
};
