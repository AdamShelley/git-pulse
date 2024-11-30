import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  ChevronDown,
  Home,
  LucideGitFork,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useRecentlyViewedStore from "@/stores/recently-viewed-store";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { Button } from "./ui/button";
import { open } from "@tauri-apps/plugin-shell";

const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

interface DevideCode {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

export function AppSidebar() {
  const navigate = useNavigate();
  const { viewedIssues } = useRecentlyViewedStore();
  const [userCode, setUserCode] = useState<string | null>(null);

  const showRepos = () => {
    console.log("Navigating");
    navigate("/select-repos");
  };

  const clearViewed = async () => {
    await invoke("clear_recents");
  };

  const oauthLogin = async () => {
    try {
      const response = await invoke<DevideCode>("initiate_device_login");
      setUserCode(response.user_code);

      await open(response.verification_uri);

      const pollInterval = setInterval(async () => {
        try {
          const token = await invoke<string>("poll_for_token", {
            deviceCode: response.device_code,
          });

          console.log(token);

          if (token) {
            clearInterval(pollInterval);
            setUserCode(null);
          }
        } catch (error) {}
      }, 15000);

      setTimeout(() => {
        clearInterval(pollInterval);
        setUserCode(null);
      }, response.expires_in * 1000);
    } catch (error) {
      console.error(error);
      setUserCode(null);
    } finally {
    }
  };

  useEffect(() => {
    useRecentlyViewedStore.getState().initialize();
  }, [clearViewed]);

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
          <SidebarGroupAction title="Add Repos">
            <Plus onClick={showRepos} />{" "}
            <span className="sr-only">Add Repos</span>
          </SidebarGroupAction>

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
                <Collapsible defaultOpen className="group/collapsible">
                  <ContextMenu>
                    <ContextMenuTrigger>
                      <CollapsibleTrigger className="pl-2 flex items-center justify-between w-full select-none text-zinc-400">
                        Recently Viewed
                        <ChevronDown
                          className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180"
                          size="1rem"
                        />
                      </CollapsibleTrigger>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="dark">
                      <ContextMenuItem
                        className="text-xs inset cursor-pointer border-none font-medium text-white font-inter"
                        onClick={clearViewed}
                      >
                        Clear Recently Viewed
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                  <CollapsibleContent>
                    {viewedIssues.length > 0 &&
                      viewedIssues.map((issue) => (
                        <SidebarMenuItem key={issue.id}>
                          <SidebarMenuButton
                            asChild
                            className="text-foreground/90"
                          >
                            <Link
                              to={`/issues/${issue.id}`}
                              className="text-xs"
                            >
                              <span>{issue.name}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <div>
          <p>
            Enter this code on GitHub: <strong>{userCode}</strong>
          </p>
          <p>Follow the instructions in your browser to complete login</p>
        </div>
        <Button onClick={oauthLogin}>Github Login</Button>
      </SidebarFooter>
    </Sidebar>
  );
}
