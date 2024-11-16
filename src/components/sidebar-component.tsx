import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { GitBranch, Home, Search, Settings } from "lucide-react";
import { Link } from "react-router-dom";

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
  return (
    <Sidebar className="border-zinc-700">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-zinc-300 text-sm">
            {/* TODO: Replace with real icon */}
            <GitBranch className="w-5 h-5 mr-2" />
            Git Pulse
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
