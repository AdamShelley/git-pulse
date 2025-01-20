import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";

interface Settings {
  theme: string;
  notifications: boolean;
  font_size: string;
  file_directory: string;
  recently_viewed_option: boolean;
  anthropic_api_key: string;
  loadSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
}

const useSettingsStore = create<Settings>((set) => ({
  theme: "system",
  notifications: true,
  font_size: "",
  file_directory: "",
  recently_viewed_option: false,
  anthropic_api_key: "",
  loadSettings: async () => {
    try {
      const savedSettings = await invoke<Settings>("load_settings");
      console.log(savedSettings);
      set(savedSettings);
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  },
  updateSettings: async (newSettings) => {
    try {
      await invoke("save_settings", { settings: newSettings });
      set((state) => {
        const newState = { ...state, ...newSettings };
        console.log("Store updated:", newState);
        return newState;
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  },
}));

export default useSettingsStore;
