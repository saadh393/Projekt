import { create } from "zustand";
import type { SortMode } from "../lib/types";

type ProjectUiState = {
  selectedCategoryId: string;
  selectedProjectId: string | null;
  searchQuery: string;
  sortMode: SortMode;
  showHiddenProjects: boolean;
  rememberSession: boolean;
  isProjectSheetOpen: boolean;
  editingProjectId: string | null;
  editingCategoryId: string | null;
  editingDividerId: string | null;
  isSettingsOpen: boolean;
  settingsTab: "general" | "launchers" | "commands";
  isReorderingCategories: boolean;
  setSelectedCategoryId: (selectedCategoryId: string) => void;
  setSelectedProjectId: (selectedProjectId: string | null) => void;
  setSearchQuery: (searchQuery: string) => void;
  setSortMode: (sortMode: SortMode) => void;
  setShowHiddenProjects: (showHiddenProjects: boolean) => void;
  setRememberSession: (rememberSession: boolean) => void;
  setProjectSheetOpen: (isProjectSheetOpen: boolean) => void;
  setEditingProjectId: (editingProjectId: string | null) => void;
  setEditingCategoryId: (editingCategoryId: string | null) => void;
  setEditingDividerId: (editingDividerId: string | null) => void;
  setSettingsOpen: (isSettingsOpen: boolean) => void;
  setSettingsTab: (settingsTab: "general" | "launchers" | "commands") => void;
  setReorderingCategories: (value: boolean) => void;
};

export const useProjectUiStore = create<ProjectUiState>((set) => ({
  selectedCategoryId: "all",
  selectedProjectId: null,
  searchQuery: "",
  sortMode: "lastOpenedAt",
  showHiddenProjects: false,
  rememberSession: true,
  isProjectSheetOpen: false,
  editingProjectId: null,
  editingCategoryId: null,
  editingDividerId: null,
  isSettingsOpen: false,
  settingsTab: "general",
  isReorderingCategories: false,
  setSelectedCategoryId: (selectedCategoryId) => set({ selectedCategoryId }),
  setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortMode: (sortMode) => set({ sortMode }),
  setShowHiddenProjects: (showHiddenProjects) => set({ showHiddenProjects }),
  setRememberSession: (rememberSession) => set({ rememberSession }),
  setProjectSheetOpen: (isProjectSheetOpen) =>
    set((state) => ({
      isProjectSheetOpen,
      editingProjectId: isProjectSheetOpen ? state.editingProjectId : null,
    })),
  setEditingProjectId: (editingProjectId) =>
    set({ editingProjectId, isProjectSheetOpen: editingProjectId !== null }),
  setEditingCategoryId: (editingCategoryId) => set({ editingCategoryId }),
  setEditingDividerId: (editingDividerId) => set({ editingDividerId }),
  setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
  setSettingsTab: (settingsTab) => set({ settingsTab }),
  setReorderingCategories: (value) => set({ isReorderingCategories: value }),
}));
