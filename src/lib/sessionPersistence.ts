import { shallow } from "zustand/shallow";
import { api } from "./api";
import { parseSessionState, pickSessionState } from "./sessionState";
import { useProjectUiStore } from "../store/useProjectUiStore";

export const restoreSession = async () => {
  try {
    const { remember, state } = await api.getUiSession();
    useProjectUiStore.setState({ rememberSession: remember, ...parseSessionState(state) });
  } catch (error) {
    console.error("Failed to restore session", error);
  }
};

export const startSessionSync = () =>
  useProjectUiStore.subscribe((state, previous) => {
    if (!state.rememberSession) return;

    const next = pickSessionState(state);
    const justEnabled = !previous.rememberSession;
    if (!justEnabled && shallow(next, pickSessionState(previous))) return;

    api
      .saveUiSessionState(JSON.stringify(next))
      .catch((error) => console.error("Failed to save session", error));
  });
