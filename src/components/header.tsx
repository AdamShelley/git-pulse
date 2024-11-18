import { Link, useLocation } from "react-router-dom";
import { SidebarTrigger } from "./ui/sidebar";
import { useEffect, useState } from "react";
import { ArrowLeft, Bell, User } from "lucide-react";

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
      <div>
        <button className="p-2 bg-zinc-900/50 rounded-md hover:bg-zinc-900/60 transition">
          <Bell className="size-4" />
        </button>
        <button className="p-2 bg-zinc-900/50 rounded-md hover:bg-zinc-900/60 transition">
          <User className="size-4" />
        </button>
      </div>
    </div>
  );
};

const HeaderText = ({ title }: { title: string }) => {
  return <h1 className=" ml-2 text-sm font-semibold">{title}</h1>;
};

const Header = () => {
  return (
    <div className="w-full flex items-center mb-5 ">
      <Toolbar />
    </div>
  );
};

export default Header;
