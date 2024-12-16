// components/TitleBar.tsx
import { Window } from "@tauri-apps/api/window";
import { useState } from "react";
import { Minus, X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TitleBar = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDoubleClick = async () => {
    const window = Window.getCurrent();
    const isMaximized = await window.isMaximized();
    if (isMaximized) {
      await window.unmaximize();
    } else {
      await window.maximize();
    }
  };

  return (
    <>
      {/* Separate drag region that spans the full width */}
      <div
        data-tauri-drag-region
        className="fixed top-0 left-0 right-0 h-8 z-40"
      />

      {/* Title bar content */}
      <div
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="h-8 fixed top-0 left-0 right-0 z-50 bg-transparent select-none flex items-center"
      >
        {/* Traffic light buttons */}
        <div className="pl-2 flex items-center gap-1.5">
          <button
            onClick={async () => await Window.getCurrent().close()}
            className={cn(
              "w-3 h-3 rounded-full transition-colors relative group flex items-center justify-center",
              isHovered ? "bg-red-500 hover:bg-red-600" : "bg-zinc-600"
            )}
          >
            {isHovered && (
              <X className="w-2 h-2 text-red-900 opacity-0 group-hover:opacity-100 absolute" />
            )}
          </button>
          <button
            onClick={async () => await Window.getCurrent().minimize()}
            className={cn(
              "w-3 h-3 rounded-full transition-colors relative group flex items-center justify-center",
              isHovered ? "bg-yellow-500 hover:bg-yellow-600" : "bg-zinc-600"
            )}
          >
            {isHovered && (
              <Minus className="w-2 h-2 text-yellow-900 opacity-0 group-hover:opacity-100 absolute" />
            )}
          </button>
          <button
            onClick={async () => {
              const window = Window.getCurrent();
              const isMaximized = await window.isMaximized();
              isMaximized ? window.unmaximize() : window.maximize();
            }}
            className={cn(
              "w-3 h-3 rounded-full transition-colors relative group flex items-center justify-center",
              isHovered ? "bg-green-500 hover:bg-green-600" : "bg-zinc-600"
            )}
          >
            {isHovered && (
              <Maximize2 className="w-2 h-2 text-green-900 opacity-0 group-hover:opacity-100 absolute" />
            )}
          </button>
        </div>

        {/* Window title */}
        <div className="flex-1 text-center text-zinc-400 text-sm font-medium">
          Git Pulse
        </div>
      </div>
    </>
  );
};

export default TitleBar;
