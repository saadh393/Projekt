import { create } from "zustand";
import type { SortMode } from "../lib/types";

type ProjectUiState = {
  selectedCategoryId: string;
  selectedProjectId: string | null;
  searchQuery: string;
  sortMode: SortMode;
  showHiddenProjects: boolean;
  isProjectSheetOpen: boolean;
  editingProjectId: string | null;
  editingCategoryId: string | null;
  isSettingsOpen: boolean;
  settingsTab: "general" | "launchers" | "commands";
  isReorderingProjects: boolean;
  isReorderingCategories: boolean;
  setSelectedCategoryId: (selectedCategoryId: string) => void;
  setSelectedProjectId: (selectedProjectId: string | null) => void;
  setSearchQuery: (searchQuery: string) => void;
  setSortMode: (sortMode: SortMode) => void;
  setShowHiddenProjects: (showHiddenProjects: boolean) => void;
  setProjectSheetOpen: (isProjectSheetOpen: boolean) => void;
  setEditingProjectId: (editingProjectId: string | null) => void;
  setEditingCategoryId: (editingCategoryId: string | null) => void;
  setSettingsOpen: (isSettingsOpen: boolean) => void;
  setSettingsTab: (settingsTab: "general" | "launchers" | "commands") => void;
  setReorderingProjects: (value: boolean) => void;
  setReorderingCategories: (value: boolean) => void;
};

export const useProjectUiStore = create<ProjectUiState>((set) => ({
  selectedCategoryId: "all",
  selectedProjectId: null,
  searchQuery: "",
  sortMode: "lastOpenedAt",
  showHiddenProjects: false,
  isProjectSheetOpen: false,
  editingProjectId: null,
  editingCategoryId: null,
  isSettingsOpen: false,
  settingsTab: "general",
  isReorderingProjects: false,
  isReorderingCategories: false,
  setSelectedCategoryId: (selectedCategoryId) => set({ selectedCategoryId }),
  setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortMode: (sortMode) => set({ sortMode }),
  setShowHiddenProjects: (showHiddenProjects) => set({ showHiddenProjects }),
  setProjectSheetOpen: (isProjectSheetOpen) =>
    set((state) => ({
      isProjectSheetOpen,
      editingProjectId: isProjectSheetOpen ? state.editingProjectId : null,
    })),
  setEditingProjectId: (editingProjectId) =>
    set({ editingProjectId, isProjectSheetOpen: editingProjectId !== null }),
  setEditingCategoryId: (editingCategoryId) => set({ editingCategoryId }),
  setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),
  setSettingsTab: (settingsTab) => set({ settingsTab }),
  setReorderingProjects: (value) =>
    set((state) => ({
      isReorderingProjects: value,
      sortMode: value ? "manual" : state.sortMode,
    })),
  setReorderingCategories: (value) => set({ isReorderingCategories: value }),
}));
