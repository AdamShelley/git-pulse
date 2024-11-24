import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";

interface RecentItem {
  id: string;
  name: string;
}

interface Recents {
  items: RecentItem[];
}

interface RecentlyViewedProps {
  viewedIssues: RecentItem[];
  addItem: (item: RecentItem) => Promise<void>;
  clearItems: () => Promise<void>;
  initialize: () => Promise<void>;
}

const useRecentlyViewedStore = create<RecentlyViewedProps>((set) => ({
  viewedIssues: [],
  initialize: async () => {
    try {
      const recents = await invoke<Recents>("load_recents");
      set({ viewedIssues: recents.items });
    } catch (error) {
      console.log(error);
    }
  },
  addItem: async ({ id, name }) => {
    try {
      const recents = await invoke<Recents>("add_recent_item", { id, name });
      set({ viewedIssues: recents.items });
    } catch (error) {
      console.error(error);
    }
  },
  clearItems: async () => {
    try {
      await invoke("clear_recents");
      set({ viewedIssues: [] });
    } catch (error) {
      console.error(error);
    }
  },
}));

export default useRecentlyViewedStore;
