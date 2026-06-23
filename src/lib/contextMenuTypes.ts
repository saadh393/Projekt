import type { ReactNode } from "react";

export type ContextMenuAction = {
  kind: "action";
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
  checked?: boolean;
};

export type ContextMenuSeparator = {
  kind: "separator";
  id: string;
};

export type ContextMenuOption = ContextMenuAction | ContextMenuSeparator;

export type ContextMenuPosition = {
  x: number;
  y: number;
};
