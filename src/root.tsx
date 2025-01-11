import { Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/sidebar-component";
import Header from "./components/header";
import { Toaster } from "sonner";
import { useEffect, useMemo } from "react";
import useSettingsStore from "./stores/settings-store";
import { usePinnedReposStore } from "./stores/pinned-repo-store";

const queryClient = new QueryClient();

export default function Root() {
  const { loadSettings } = useSettingsStore();
  const { initialize } = usePinnedReposStore();

  useEffect(() => {
    loadSettings();
    initialize();
  }, []);

  // Debug log
  const font_size = useSettingsStore((state) => state.font_size);

  console.log("Root rendering with font_size:", font_size);

  const textClass = useMemo(() => {
    const size = font_size || "medium";
    console.log("Calculating text class for:", size);
    return (
      {
        small: "text-sm",
        medium: "text-base",
        large: "text-lg",
        "x-large": "text-xl",
      }[size] || "text-base"
    );
  }, [font_size]);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Toaster />

        <div className={textClass}>
          <SidebarProvider className={`dark font-inter`}>
            <AppSidebar />
            <main
              className={`dark text-primary text-base-dynamic bg-zinc-950 w-screen h-screen overflow-x-hidden font-inter p-5`}
            >
              <Header />
              <Outlet />
            </main>
          </SidebarProvider>
        </div>
      </QueryClientProvider>
    </>
  );
}
