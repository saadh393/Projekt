import { useEffect } from "react";
import { api } from "../lib/api";
import { useProjectUiStore } from "../store/useProjectUiStore";

export function usePreferencesHydration() {
  useEffect(() => {
    let ready = false;

    const hydrate = async () => {
      try {
        const [sortMode, showHiddenProjects] = await Promise.all([
          api.getProjectSortMode(),
          api.getShowHiddenProjects(),
        ]);
        const store = useProjectUiStore.getState();
        store.setSortMode(sortMode);
        store.setShowHiddenProjects(showHiddenProjects);
      } catch {
        // keep defaults if persistence layer is unavailable
      }
      ready = true;
    };
    void hydrate();

    const unsubscribe = useProjectUiStore.subscribe((state, previous) => {
      if (!ready) return;
      if (state.sortMode !== previous.sortMode) {
        void api.setProjectSortMode(state.sortMode).catch(() => {});
      }
      if (state.showHiddenProjects !== previous.showHiddenProjects) {
        void api.setShowHiddenProjects(state.showHiddenProjects).catch(() => {});
      }
    });

    return unsubscribe;
  }, []);
}
