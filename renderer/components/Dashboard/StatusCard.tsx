import { Button } from "@heroui/react";
import { Play, Square, Network, Clock, Activity, ArrowRightLeft, Hash } from "lucide-react";
import { useServerStore } from "../../store/serverStore";

export const StatusCard = () => {
  const { isRunning, toggleServer: toggleStatus } = useServerStore();
  return (
  <div className="relative group rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all duration-500">
    {/* Animated background glow when running */}
    {isRunning && (
      <div className="absolute inset-0 bg-linear-to-br from-(--accent-secondary)/20 via-transparent to-(--accent-fuchsia)/20 opacity-100 transition-opacity duration-1000"></div>
    )}
    
    <div className={`relative h-full bg-(--glass-bg) backdrop-blur-md border rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col gap-4 sm:gap-6 transition-colors duration-500
      ${isRunning ? 'border-(--accent-secondary)/30' : 'border-(--glass-highlight)'}
    `}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-500
            ${isRunning ? 'bg-(--accent-secondary)/20 text-(--accent-indigo) border border-(--accent-secondary)/30 shadow-[0_0_20px_var(--accent-secondary)]/20' : 'bg-(--glass-highlight) text-(--text-dim) border border-(--glass-border)'}
          `}>
            <Network className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-base sm:text-lg font-bold text-white leading-tight transition-all">Connection</h3>
            <span className="text-[9px] sm:text-[10px] font-semibold text-white/40 uppercase tracking-widest mt-0.5 sm:mt-1">
              Quick Tunnel
            </span>
          </div>
        </div>
        <div className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-500
          ${isRunning ? 'bg-(--accent-secondary)/20 border border-(--accent-secondary)/40 text-(--accent-indigo) shadow-[0_0_15px_var(--accent-secondary)]/40' : 'bg-(--glass-highlight) border border-(--glass-border) text-(--text-muted)'}
        `}>
          {isRunning ? 'Online' : 'Offline'}
        </div>
      </div>

      <div className="flex gap-2 sm:gap-3 items-center">
        <div className={`flex-1 rounded-xl bg-black/20 border transition-all duration-300 relative ${isRunning ? 'opacity-50 pointer-events-none border-white/3' : 'border-white/10 focus-within:border-indigo-500/50'}`}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
            <Hash className="w-4 h-4" />
          </div>
          <input 
            type="number" 
            placeholder="3000" 
            defaultValue="3000"
            disabled={isRunning}
            className="w-full bg-transparent border-none text-white text-sm py-3 pl-10 pr-4 outline-none font-mono placeholder:text-white/20"
          />
        </div>
        <div className={`shrink-0 min-w-[100px] rounded-xl bg-black/20 border transition-all duration-300 flex items-center p-1 ${isRunning ? 'opacity-50 pointer-events-none border-white/3' : 'border-white/10'}`}>
          <select 
            disabled={isRunning}
            className="w-full bg-transparent text-white text-xs font-bold uppercase tracking-wider px-3 py-2 outline-none appearance-none cursor-pointer"
          >
            <option value="http" className="bg-[#111]">HTTP(S)</option>
            <option value="tcp" className="bg-[#111]">TCP</option>
            <option value="udp" className="bg-[#111]">UDP</option>
          </select>
          <ArrowRightLeft className="w-3.5 h-3.5 text-white/40 mr-3 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="p-3.5 sm:p-4 rounded-lg sm:rounded-xl bg-black/20 border border-white/3 flex flex-col gap-1">
           <div className="flex items-center gap-1.5 text-white/30 mb-0.5">
             <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
             <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">Uptime</span>
           </div>
           <span className={`text-base sm:text-lg font-mono ${isRunning ? 'text-white' : 'text-white/20'}`}>
             {isRunning ? "02:14:55" : "00:00:00"}
           </span>
        </div>
        <div className="p-3.5 sm:p-4 rounded-lg sm:rounded-xl bg-black/20 border border-white/3 flex flex-col gap-1">
           <div className="flex items-center gap-1.5 text-white/30 mb-0.5">
             <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
             <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">Latency</span>
           </div>
           <span className={`text-base sm:text-lg font-mono ${isRunning ? 'text-green-400' : 'text-white/20'}`}>
             {isRunning ? "42ms" : "---"}
           </span>
        </div>
      </div>

      <Button
        size="md"
        onPress={toggleStatus}
        className={`mt-2 h-10 sm:h-11 w-full rounded-lg sm:rounded-xl font-bold text-[12px] sm:text-[13px] transition-all duration-500 border-none relative overflow-hidden group
          ${
            isRunning
              ? "bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30"
              : "bg-white text-black hover:bg-gray-100 shadow-lg shadow-white/10"
          }
        `}
      >
        {/* Glow effect on button */}
        {!isRunning && <div className="absolute inset-0 bg-white blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>}
        
        <div className="flex items-center justify-center gap-4 relative z-10 w-full">
          {isRunning ? (
            <Square className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-1" />
          )}
          <span className="tracking-[0.15em] uppercase">
            {isRunning ? "Terminate Connection" : "Initialize Tunnel"}
          </span>
        </div>
        <div className="absolute inset-0 bg-black/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
      </Button>
    </div>
  </div>
  );
};
