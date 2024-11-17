import { useLocation } from "react-router-dom";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import { useEffect, useState } from "react";

type Props = {};

const Header = (props: Props) => {
  const [headerTitle, setHeaderTitle] = useState("Git Pulse");
  const location = useLocation();
  const { pathname } = location;
  const { open } = useSidebar();

  console.log(open);

  useEffect(() => {
    if (pathname === "/") {
      setHeaderTitle("Git Pulse");
    } else if (pathname.includes("/issues")) {
      setHeaderTitle("Issues Dashboard");
    }
  }, [pathname]);

  return (
    <div className="w-full flex items-center">
      {!open && <SidebarTrigger />}
      <h1 className="text-sm font-semibold ml-2">{headerTitle}</h1>
    </div>
  );
};

export default Header;
