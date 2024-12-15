import { Window } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";

const TitleBar = () => {
  const handleMinimize = async () => {
    const window = Window.getCurrent();
    await window.minimize();
  };

  const handleMaximize = async () => {
    const window = Window.getCurrent();
    const isMaximized = await window.isMaximized();
    if (isMaximized) {
      await window.unmaximize();
    } else {
      await window.maximize();
    }
  };

  const handleClose = async () => {
    const window = Window.getCurrent();
    await window.close();
  };

  return (
    <div
      data-tauri-drag-region
      className="h-8 flex justify-between items-center fixed top-0 left-0 right-0 bg-background/50 backdrop-blur-sm"
    >
      <div className="px-4">Git Pulse</div>
      <div className="flex">
        <button
          onClick={handleMinimize}
          className="inline-flex items-center justify-center h-8 w-8 hover:bg-accent"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={handleMaximize}
          className="inline-flex items-center justify-center h-8 w-8 hover:bg-accent"
        >
          <Square className="h-4 w-4" />
        </button>
        <button
          onClick={handleClose}
          className="inline-flex items-center justify-center h-8 w-8 hover:bg-red-500/20"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
