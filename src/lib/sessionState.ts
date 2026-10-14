import { sortLabels } from "./constants";
import type { SortMode } from "./types";

export type SessionState = {
  selectedCategoryId: string;
  selectedProjectId: string | null;
  sortMode: SortMode;
  showHiddenProjects: boolean;
};

export const pickSessionState = (state: SessionState): SessionState => ({
  selectedCategoryId: state.selectedCategoryId,
  selectedProjectId: state.selectedProjectId,
  sortMode: state.sortMode,
  showHiddenProjects: state.showHiddenProjects,
});

export const parseSessionState = (raw: string | null): Partial<SessionState> => {
  if (!raw) return {};

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return {};
  }

  if (!value || typeof value !== "object") return {};

  const { selectedCategoryId, selectedProjectId, sortMode, showHiddenProjects } =
    value as Record<string, unknown>;

  return {
    ...(typeof selectedCategoryId === "string" ? { selectedCategoryId } : {}),
    ...(typeof selectedProjectId === "string" ? { selectedProjectId } : {}),
    ...(typeof sortMode === "string" && Object.hasOwn(sortLabels, sortMode)
      ? { sortMode: sortMode as SortMode }
      : {}),
    ...(typeof showHiddenProjects === "boolean" ? { showHiddenProjects } : {}),
  };
};
