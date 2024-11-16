import { useLocation } from "react-router-dom";
import { SidebarTrigger } from "./ui/sidebar";
import { useEffect, useState } from "react";

type Props = {};

const Header = (props: Props) => {
  const [headerTitle, setHeaderTitle] = useState("Git Pulse");
  const location = useLocation();
  const { pathname } = location;

  useEffect(() => {
    if (pathname === "/") {
      setHeaderTitle("Git Pulse");
    } else if (pathname.includes("/issues")) {
      setHeaderTitle("Issues Dashboard");
    }
  }, [pathname]);

  return (
    <div className="w-full flex items-center">
      <SidebarTrigger />
      <h1 className="text-sm font-semibold ml-2">{headerTitle}</h1>
    </div>
  );
};

export default Header;
