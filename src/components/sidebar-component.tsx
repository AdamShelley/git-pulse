import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BoxSelect, Home, LucideGitFork, Search, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import useRecentlyViewedStore from "@/stores/recently-viewed-store";
import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Search",
    url: "",
    icon: Search,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const { viewedIssues } = useRecentlyViewedStore();

  const showRepos = () => {
    console.log("Navigating");
    navigate("/select-repos");
  };

  const clearViewed = async () => {
    await invoke("clear_recents");
  };

  useEffect(() => {
    useRecentlyViewedStore.getState().initialize();

    console.log(viewedIssues);
  }, []);

  return (
    <Sidebar className="border-zinc-700 ">
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-300 text-sm flex items-center justify-between">
            {/* TODO: Replace with real icon */}
            <div className="flex ">
              <LucideGitFork className="w-5 h-5 mr-2" />
              Git Pulse
            </div>
          </SidebarGroupLabel>

          <SidebarGroupContent className="">
            <SidebarMenu className="mt-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <SidebarMenu className="mt-5 text-zinc-400 font-semibold">
              <SidebarMenuItem>
                <div className="text-zinc-400 font-semibold">
                  <h3>Recently Viewed</h3>
                </div>
              </SidebarMenuItem>
              {viewedIssues.length > 0 &&
                viewedIssues.map((issue) => (
                  <SidebarMenuItem key={issue.id}>
                    <SidebarMenuButton
                      asChild
                      className="m-0 pl-1 text-foreground/80"
                    >
                      <Link to={`/issues/${issue.id}`} className="text-xs">
                        <span>{issue.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              <SidebarMenuItem>
                <Button onClick={clearViewed}>Clear</Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button
          className="m-3 border border-white/20"
          variant="outline"
          onClick={showRepos}
        >
          <BoxSelect />
          Select Repo's to follow
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
