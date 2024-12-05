import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";

interface PinnedReposStore {
  pinnedIds: string[];
  setPinnedIds: (
    newValue: string[] | ((prev: string[]) => string[])
  ) => Promise<void>;
  initialize: () => Promise<void>;
}

const usePinnedReposStore = create<PinnedReposStore>((set) => ({
  pinnedIds: [],
  setPinnedIds: async (newValue) => {
    try {
      const nextState =
        typeof newValue === "function"
          ? newValue(usePinnedReposStore.getState().pinnedIds)
          : newValue;

      await invoke("save_pinned_repos", { repos: nextState });
      set({ pinnedIds: nextState });
    } catch (error) {
      console.error(error);
    }
  },
  initialize: async () => {
    try {
      const ids = await invoke<string[]>("get_pinned_repos");
      set({ pinnedIds: ids });
    } catch (error) {
      console.error(error);
    }
  },
}));

export { usePinnedReposStore };
