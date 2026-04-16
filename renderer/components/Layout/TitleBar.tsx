import { Minus, Square, X, Copy } from "lucide-react";
import { useState, useEffect } from "react";

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.api) return;

    // Check initial state
    window.api.isMaximized().then((maximized: boolean) => {
      setIsMaximized(maximized);
    });

    const unSubMax = window.api.onMaximized(() => setIsMaximized(true));
    const unSubUnmax = window.api.onUnmaximized(() => setIsMaximized(false));

    return () => {
      unSubMax();
      unSubUnmax();
    };
  }, []);

  const handleMinimize = () => {
    window.api?.minimize();
  };

  const handleMaximize = () => {
    window.api?.maximize();
  };

  const handleClose = () => {
    window.api?.close();
  };

  return (
    <div className="flex justify-between items-center w-full h-10 shrink-0 relative [-webkit-app-region:drag] z-50 group select-none overflow-hidden">
      {/* Brand Section */}
      <div className="relative flex-1 h-full flex items-center px-4 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src="/images/logo.png"
              alt="Logo"
              className="w-6 h-6 object-cover"
            />
          </div>
          <span className="text-xs font-black tracking-[0.25em] text-(--text-main)/90 uppercase leading-none">
            Proxlyte
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="relative flex h-full [-webkit-app-region:no-drag] z-10">
        <button
          onClick={handleMinimize}
          className="flex items-center justify-center w-10 h-full text-(--text-main) hover:bg-(--glass-border-light) transition-all duration-300"
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleMaximize}
          className="flex items-center justify-center w-10 h-full text-(--text-main) hover:bg-(--glass-border-light) transition-all duration-300"
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? (
            <Copy className="w-3 h-3" />
          ) : (
            <Square className="w-3 h-3" />
          )}
        </button>
        <button
          onClick={handleClose}
          className="flex items-center justify-center w-10 h-full text-(--text-main) hover:bg-(--color-danger) hover:text-white"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
