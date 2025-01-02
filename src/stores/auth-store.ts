import { invoke } from "@tauri-apps/api/core";
import { create } from "zustand";

interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  username: string;
  checkAuth: () => Promise<void>;
  setLoggedIn: (status: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  isLoading: true,
  username: "",
  checkAuth: async () => {
    try {
      const authenticated = await invoke<boolean>("check_auth");

      if (authenticated) {
        const username = await invoke<string>("get_username");
        set({ username });
      }

      set({ isLoggedIn: authenticated, isLoading: false });
    } catch (error) {
      console.error("Failed to check auth:", error);
      set({ isLoggedIn: false, isLoading: false });
    }
  },
  setLoggedIn: (status: boolean) => set({ isLoggedIn: status }),
}));
