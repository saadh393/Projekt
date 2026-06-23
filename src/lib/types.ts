export type EntityId = string;

export type SortMode = "manual" | "name" | "createdAt" | "lastOpenedAt";

export type TerminalPreference = "terminal" | "iterm2" | "warp";

export type Category = {
  id: EntityId;
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  hidden: boolean;
  createdAt: number;
};

export type Project = {
  id: EntityId;
  name: string;
  description: string;
  path: string;
  categoryId: EntityId | null;
  categoryName?: string;
  color: string;
  sortOrder: number;
  hidden: boolean;
  tags: string[];
  pinnedCommands: EntityId[];
  lastOpenedAt: number | null;
  createdAt: number;
  updatedAt: number;
};

export type AppLauncher = {
  id: EntityId;
  label: string;
  appPath: string;
  sortOrder: number;
};

export type CommandTemplate = {
  id: EntityId;
  label: string;
  command: string;
};

export type Divider = {
  id: EntityId;
  label: string | null;
  categoryId: EntityId | null;
  sortOrder: number;
  createdAt: number;
};

export type DividerDraft = {
  label: string | null;
  categoryId: EntityId | null;
  sortOrder?: number;
};

export type ReorderItem = {
  kind: "project" | "divider";
  id: EntityId;
};

export type ListItem =
  | { kind: "project"; item: Project }
  | { kind: "divider"; item: Divider };

export type GeneralSettings = {
  preferredTerminal: TerminalPreference;
};

export type ProjectDraft = {
  name: string;
  description: string;
  path: string;
  categoryId: EntityId | null;
  color: string;
  tags: string[];
  pinnedCommands: EntityId[];
  hidden?: boolean;
  sortOrder?: number;
};

export type CategoryDraft = {
  name: string;
  icon: string;
  color: string;
  sortOrder: number;
  hidden?: boolean;
};

export type LauncherDraft = {
  label: string;
  appPath: string;
};

export type CommandTemplateDraft = {
  label: string;
  command: string;
};
