import { Outlet } from "react-router-dom";
import { SidebarProvider } from "./components/ui/sidebar";
import { AppSidebar } from "./components/sidebar-component";
import Header from "./components/header";

export default function Root() {
  return (
    <>
      <SidebarProvider className="dark font-inter">
        <AppSidebar />
        <main className="dark text-white bg-zinc-900 w-screen h-screen overflow-x-hidden font-inter p-5">
          <Header />
          <Outlet />
        </main>
      </SidebarProvider>
    </>
  );
}
