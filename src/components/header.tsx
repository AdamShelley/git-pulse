import { Link, useLocation } from "react-router-dom";
import { SidebarTrigger } from "./ui/sidebar";
import { useEffect, useState } from "react";
import { ArrowLeft, Bell, User } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";

const Toolbar = () => {
  const [headerTitle, setHeaderTitle] = useState("Git Pulse");
  const location = useLocation();
  const { pathname } = location;

  useEffect(() => {
    if (pathname === "/") {
      setHeaderTitle("Git Pulse");
    } else if (pathname.includes("/issues/")) {
      setHeaderTitle("Issue Detail");
    } else if (pathname.includes("/issues")) {
      setHeaderTitle("Issues Dashboard");
    }
  }, [pathname]);

  return (
    <div className="flex items-center justify-between w-full gap-2">
      <div className="flex items-center justify-center">
        <SidebarTrigger />
        {headerTitle === "Git Pulse" ? null : (
          <Link
            to="/"
            className="p-2 bg-zinc-900/50 rounded-md hover:bg-zinc-900/60 transition"
          >
            <ArrowLeft className="size-4" />
          </Link>
        )}
        <HeaderText title={headerTitle} />
      </div>
      <div className="space-x-2">
        {/* <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bell className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4 -translate-x-8">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Notifications</h4>

              <Notifications />
            </div>
          </PopoverContent>
        </Popover>*/}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <User className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4 -translate-x-8">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Profile</h4>
              <p className="text-sm text-muted-foreground">
                Manage your account
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

const HeaderText = ({ title }: { title: string }) => {
  return <h1 className="ml-2 text-sm font-semibold">{title}</h1>;
};

const Header = () => {
  return (
    <div className="w-full flex items-center mb-5 ">
      <Toolbar />
    </div>
  );
};

export default Header;
