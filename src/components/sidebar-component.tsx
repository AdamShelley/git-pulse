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

  const showRepos = () => {
    console.log("Navigating");
    navigate("/select-repos");
  };

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
                <SidebarMenuButton asChild>
                  <Link to="/issues">Recently Viewed</Link>
                </SidebarMenuButton>
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
