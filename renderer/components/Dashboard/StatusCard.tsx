import { useState, useEffect } from "react";
import { Button, Select, ListBox, Input } from "@heroui/react";
import { Play, Square, Network, Clock, Activity, Hash } from "lucide-react";
import { useTunnelStore } from "../../store/tunnelStore";

export const StatusCard = () => {
  const { tunnels, updateTunnel, toggleTunnelStatus } = useTunnelStore();
  const defaultTunnel = tunnels.find((t) => t.id === "default") || tunnels[0];
  const isRunning = defaultTunnel?.status === "running";

  const handleToggle = () => {
    if (defaultTunnel) {
      toggleTunnelStatus(defaultTunnel.id);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[280px] sm:h-[320px] rounded-2xl sm:rounded-3xl bg-(--glass-bg) border border-(--glass-highlight) animate-pulse" />
    );
  }
  return (
    <div className="relative group rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all duration-500">
      {/* Animated background glow when running */}
      {isRunning && (
        <div className="absolute inset-0 bg-linear-to-br from-(--accent-secondary)/20 via-transparent to-(--accent-fuchsia)/20 opacity-100 transition-opacity duration-1000"></div>
      )}

      <div
        className={`relative h-full bg-(--glass-bg) backdrop-blur-md border rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col gap-4 sm:gap-6 transition-colors duration-500
      ${isRunning ? "border-(--accent-secondary)/30" : "border-(--glass-highlight)"}
    `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-500
            ${isRunning ? "bg-(--accent-secondary)/20 text-(--accent-indigo) border border-(--accent-secondary)/30 shadow-[0_0_20px_var(--accent-secondary)]/20" : "bg-(--glass-highlight) text-(--text-dim) border border-(--glass-border)"}
          `}
            >
              <Network className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight transition-all">
                Connection
              </h3>
              <span className="text-[9px] sm:text-[10px] font-semibold text-white/40 uppercase tracking-widest mt-0.5 sm:mt-1">
                Quick Tunnel
              </span>
            </div>
          </div>
          <div
            className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all duration-500
          ${isRunning ? "bg-(--accent-secondary)/20 border border-(--accent-secondary)/40 text-(--accent-indigo) shadow-[0_0_15px_var(--accent-secondary)]/40" : "bg-(--glass-highlight) border border-(--glass-border) text-(--text-muted)"}
        `}
          >
            {isRunning ? "Online" : "Offline"}
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3 items-center">
          <div
            className={`flex-1 rounded-xl bg-black/20 border transition-all duration-300 relative ${isRunning ? "opacity-50 pointer-events-none border-white/3" : "border-white/10 focus-within:border-indigo-500/50"}`}
          >
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
              <Hash className="w-4 h-4" />
            </div>
            <Input
              type="number"
              placeholder="3000"
              value={defaultTunnel?.port || "3000"}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateTunnel(defaultTunnel.id, { port: e.target.value })
              }
              disabled={isRunning}
              className="w-full bg-transparent border-none text-white text-sm py-3 ps-10 pe-4 outline-none font-mono placeholder:text-white/20"
            />
          </div>
          <div
            className={`shrink-0 min-w-25 rounded-xl bg-black/20 border transition-all duration-300 flex items-center p-1 ${isRunning ? "opacity-50 pointer-events-none border-white/3" : "border-white/10"}`}
          >
            <Select
              aria-label="Protocol"
              selectedKey={defaultTunnel?.protocol || "http"}
              isDisabled={isRunning}
              onSelectionChange={(key) => {
                const val = key as string;
                if (val && defaultTunnel) {
                  updateTunnel(defaultTunnel.id, { protocol: val });
                }
              }}
              className="w-full"
            >
              <Select.Trigger className="bg-transparent hover:bg-white/5 data-[hovered=true]:bg-white/5 h-8 min-h-8 shadow-none transition-all flex items-center justify-center gap-2 outline-none border-none">
                <Select.Value className="text-white text-[10px] font-black uppercase tracking-widest text-center" />
              </Select.Trigger>
              <Select.Popover className="bg-neutral-900 border border-white/10 rounded-xl p-1 min-w-[120px]">
                <ListBox className="p-0">
                  <ListBox.Item
                    id="http"
                    textValue="HTTP(S)"
                    className="text-white text-[10px] font-bold uppercase data-[hovered=true]:bg-white/5 p-2 rounded-lg cursor-pointer transition-colors"
                  >
                    HTTP(S)
                  </ListBox.Item>
                  <ListBox.Item
                    id="tcp"
                    textValue="TCP"
                    className="text-white text-[10px] font-bold uppercase data-[hovered=true]:bg-white/5 p-2 rounded-lg cursor-pointer transition-colors"
                  >
                    TCP
                  </ListBox.Item>
                  <ListBox.Item
                    id="udp"
                    textValue="UDP"
                    className="text-white text-[10px] font-bold uppercase data-[hovered=true]:bg-white/5 p-2 rounded-lg cursor-pointer transition-colors"
                  >
                    UDP
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="p-3.5 sm:p-4 rounded-lg sm:rounded-xl bg-black/20 border border-white/3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-white/30 mb-0.5">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">
                Uptime
              </span>
            </div>
            <span
              className={`text-base sm:text-lg font-mono ${isRunning ? "text-white" : "text-white/20"}`}
            >
              {isRunning ? "02:14:55" : "00:00:00"}
            </span>
          </div>
          <div className="p-3.5 sm:p-4 rounded-lg sm:rounded-xl bg-black/20 border border-white/3 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-white/30 mb-0.5">
              <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">
                Latency
              </span>
            </div>
            <span
              className={`text-base sm:text-lg font-mono ${isRunning ? "text-green-400" : "text-white/20"}`}
            >
              {isRunning ? "42ms" : "---"}
            </span>
          </div>
        </div>

        <Button
          size="md"
          onPress={handleToggle}
          className={`mt-2 h-10 sm:h-11 w-full rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all duration-500 border-none relative overflow-hidden group
          ${
            isRunning
              ? "bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30"
              : "bg-white text-black hover:bg-gray-100 shadow-lg shadow-white/10"
          }
        `}
        >
          {/* Glow effect on button */}
          {!isRunning && (
            <div className="absolute inset-0 bg-white blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
          )}

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
