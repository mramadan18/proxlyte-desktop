import { Tooltip, TooltipTrigger, TooltipContent, Button } from "@heroui/react";
import { Copy, Trash2, Power } from "lucide-react";

export const TerminalHeader = () => (
  <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/5 bg-white/2 shrink-0">
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="flex gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
        <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
      </div>
      <div className="w-px h-3 sm:h-4 bg-white/10 mx-1 sm:mx-2"></div>
      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-white/50 flex items-center gap-1.5 sm:gap-2">
        <Power className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-fuchsia-400" />
        Live stdout/stderr Buffer
      </span>
    </div>
    <div className="flex items-center gap-2 sm:gap-3">
      <TooltipTrigger>
        <Button
          size="sm"
          isIconOnly
          variant="ghost"
          className="text-white/30 hover:text-white hover:bg-white/10 w-8 h-8 sm:w-9 sm:h-9 min-w-8 border-none"
        >
          <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
        <Tooltip>
          <TooltipContent className="bg-white/10 backdrop-blur-lg border border-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
            Copy Output
          </TooltipContent>
        </Tooltip>
      </TooltipTrigger>

      <TooltipTrigger>
        <Button
          size="sm"
          isIconOnly
          variant="ghost"
          className="text-white/30 hover:text-red-500 hover:bg-red-500/10 w-8 h-8 sm:w-9 sm:h-9 min-w-8 border-none"
        >
          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
        <Tooltip>
          <TooltipContent className="bg-red-500/20 backdrop-blur-lg border border-red-500/40 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold">
            Clear Console
          </TooltipContent>
        </Tooltip>
      </TooltipTrigger>
    </div>
  </div>
);
