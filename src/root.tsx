import { Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/sidebar-component";
import Header from "./components/header";
import { Toaster } from "sonner";
import { useEffect } from "react";
import useSettingsStore from "./stores/settings-store";

const queryClient = new QueryClient();

export default function Root() {
  const { loadSettings } = useSettingsStore();

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <SidebarProvider className="dark font-inter">
          <AppSidebar />
          <main className="dark text-primary bg-zinc-950 w-screen h-screen overflow-x-hidden font-inter p-5 ">
            <Header />
            <Outlet />
          </main>
        </SidebarProvider>
      </QueryClientProvider>
    </>
  );
}
