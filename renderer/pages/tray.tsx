import { useState, useEffect } from "react";
import { useTunnelStore } from "../store/tunnelStore";
import {
  Copy,
  Check,
  Square,
  Play,
  Monitor,
  PowerOff,
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Globe,
  ExternalLink,
  Zap,
} from "lucide-react";

export default function TrayPage() {
  const { tunnels, toggleTunnelStatus, addTunnel } = useTunnelStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [quickPort, setQuickPort] = useState<string>("3000");
  const [liveTraffic, setLiveTraffic] = useState<{ rx: number; tx: number }>({
    rx: 0,
    tx: 0,
  });
  const [arrowPos, setArrowPos] = useState<number>(240);

  const activeTunnels = tunnels.filter(
    (t) => t.status === "running" || t.status === "starting",
  );

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let unArrow: (() => void) | undefined;
    if (typeof window !== "undefined" && window.api) {
      if (window.api.onTrafficData) {
        unsubscribe = window.api.onTrafficData((download, upload) => {
          setLiveTraffic({
            rx: Math.round(download * 10) / 10,
            tx: Math.round(upload * 10) / 10,
          });
        });
      }
      if (window.api.onTrayArrowPos) {
        unArrow = window.api.onTrayArrowPos((pos) => {
          const clamped = Math.max(25, Math.min(455, pos));
          setArrowPos(clamped);
        });
      }
    }
    return () => {
      if (unsubscribe) unsubscribe();
      if (unArrow) unArrow();
    };
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.api &&
      window.api.updateTrayTooltip
    ) {
      const activeCount = activeTunnels.length;
      if (activeCount > 0) {
        window.api.updateTrayTooltip(
          `Proxlyte - ${activeCount} Active Connection${activeCount > 1 ? "s" : ""}`,
        );
      } else {
        window.api.updateTrayTooltip("Proxlyte - Idle");
      }
    }
  }, [activeTunnels.length]);

  const handleCopy = (url?: string, id?: string) => {
    if (!url || !id) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenUrl = (url?: string) => {
    if (!url) return;
    if (
      typeof window !== "undefined" &&
      window.api &&
      window.api.openExternal
    ) {
      window.api.openExternal(url);
    } else {
      window.open(url, "_blank");
    }
  };

  const handleQuickLaunch = async () => {
    const portNum = parseInt(quickPort, 10);
    if (isNaN(portNum) || portNum <= 0 || portNum > 65535) return;

    const isPortBusy = tunnels.some(
      (t) =>
        t.port === quickPort &&
        (t.status === "running" || t.status === "starting"),
    );
    if (isPortBusy) {
      alert(`Port ${quickPort} is already active on another connection!`);
      return;
    }

    const existing = tunnels.find(
      (t) => t.port === quickPort && t.status === "stopped",
    );
    if (existing) {
      await toggleTunnelStatus(existing.id);
    } else {
      addTunnel();
      setTimeout(() => {
        const currentTunnels = useTunnelStore.getState().tunnels;
        const newTunnel = currentTunnels[currentTunnels.length - 1];
        if (newTunnel) {
          useTunnelStore
            .getState()
            .updateTunnel(newTunnel.id, { port: quickPort });
          toggleTunnelStatus(newTunnel.id);
        }
      }, 100);
    }
  };

  const handleStopAll = async () => {
    if (
      typeof window !== "undefined" &&
      window.api &&
      window.api.stopAllTunnels
    ) {
      await window.api.stopAllTunnels();
    }
    activeTunnels.forEach((t) => {
      useTunnelStore
        .getState()
        .updateTunnel(t.id, { status: "stopped", publicUrl: undefined });
    });
  };

  const handleOpenDashboard = () => {
    if (
      typeof window !== "undefined" &&
      window.api &&
      window.api.showMainWindow
    ) {
      window.api.showMainWindow();
    }
  };

  return (
    <div className="h-full w-full p-2 flex font-sans relative">
      {/* Outer Obsidian Glass Panel */}
      <div className="flex-1 flex flex-col bg-[#0a0a0f]/95 border border-white/8 rounded-2xl overflow-hidden text-(--text-main)">
        {/* Sleek Top Header Bar */}
        <div className="px-4 py-3 bg-linear-to-r from-white/4 to-transparent border-b border-white/6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="/images/logo.png"
                alt="Proxlyte Logo"
                className="w-7 h-7 object-contain drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]"
              />
              {activeTunnels.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-[#0a0a0f] animate-pulse" />
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wider text-white leading-none">
                  PROXLYTE
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border leading-tight ${
                    activeTunnels.length > 0
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-white/4 text-white/40 border-white/6"
                  }`}
                >
                  {activeTunnels.length > 0
                    ? `${activeTunnels.length} ACTIVE`
                    : "IDLE"}
                </span>
              </div>
            </div>
          </div>

          {/* Telemetry & Dashboard Button */}
          <div className="flex items-center gap-2.5">
            {activeTunnels.length > 0 && (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/50 border border-white/6 text-[10px] font-mono text-white/70 shadow-inner">
                <span className="flex items-center text-emerald-400 font-semibold">
                  <ArrowDownRight size={11} className="mr-0.5" />
                  {liveTraffic.rx}{" "}
                  <span className="text-[9px] text-white/40 ml-0.5">KB/s</span>
                </span>
                <span className="text-white/15">/</span>
                <span className="flex items-center text-indigo-400 font-semibold">
                  <ArrowUpRight size={11} className="mr-0.5" />
                  {liveTraffic.tx}{" "}
                  <span className="text-[9px] text-white/40 ml-0.5">KB/s</span>
                </span>
              </div>
            )}

            <button
              onClick={handleOpenDashboard}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/6 hover:bg-white/12 text-white text-[11px] font-semibold transition-all border border-white/8 hover:border-white/18 shadow-sm active:scale-95"
            >
              <Monitor size={12} className="text-indigo-400" />
              <span>Dashboard</span>
            </button>
          </div>
        </div>

        {/* Active Connections Workspace */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2 min-h-0 flex flex-col">
          <div className="flex items-center justify-between px-1 shrink-0">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
              <span>Active Connections</span>
              <span className="bg-white/6 text-white/70 px-1.5 py-0.2 rounded text-[9px]">
                {activeTunnels.length}
              </span>
            </span>
            {activeTunnels.length > 1 && (
              <button
                onClick={handleStopAll}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-[10px] font-bold transition-colors border border-rose-500/20 active:scale-95"
              >
                <PowerOff size={10} />
                <span>Kill All</span>
              </button>
            )}
          </div>

          {activeTunnels.length > 0 ? (
            activeTunnels.map((tunnel) => (
              <div
                key={tunnel.id}
                className="p-2.5 rounded-xl bg-linear-to-br from-white/5 to-white/1 border border-white/7 hover:border-white/14 transition-all shadow-sm group"
              >
                {/* Top Card Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="text-xs font-black text-white font-mono tracking-wide">
                      PORT {tunnel.port}
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 uppercase tracking-wider">
                      {tunnel.domainType === "custom" ? "Custom" : "Quick"}
                    </span>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(tunnel.publicUrl, tunnel.id)}
                      disabled={!tunnel.publicUrl}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                        copiedId === tunnel.id
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5"
                      }`}
                      title="Copy Public URL"
                    >
                      {copiedId === tunnel.id ? (
                        <>
                          <Check size={11} />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => toggleTunnelStatus(tunnel.id)}
                      className="p-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 transition-colors border border-rose-500/20"
                      title="Stop Tunnel"
                    >
                      <Square size={12} className="fill-rose-400" />
                    </button>
                  </div>
                </div>

                {/* Clickable URL Bar */}
                <div
                  onClick={() => handleOpenUrl(tunnel.publicUrl)}
                  className={`px-2.5 py-1.5 rounded-lg bg-black/45 hover:bg-black/70 border border-white/5 hover:border-indigo-500/30 transition-all flex items-center justify-between group/url ${
                    tunnel.publicUrl ? "cursor-pointer" : "opacity-60"
                  }`}
                  title="Click to visit site in browser"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <Globe size={12} className="text-indigo-400 shrink-0" />
                    <span className="text-[11px] font-mono text-indigo-200/90 group-hover/url:text-indigo-100 truncate block">
                      {tunnel.publicUrl
                        ? tunnel.publicUrl.replace("https://", "")
                        : "Generating tunnel domain..."}
                    </span>
                  </div>
                  {tunnel.publicUrl && (
                    <ExternalLink
                      size={12}
                      className="text-white/30 group-hover/url:text-indigo-300 shrink-0 transition-colors"
                    />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex-1 min-h-[95px] flex flex-col items-center justify-center text-center px-4 border border-dashed border-white/7 rounded-xl bg-black/20">
              <div className="p-2.5 rounded-full bg-white/3 border border-white/5 mb-2">
                <Activity size={18} className="text-white/30" />
              </div>
              <p className="text-xs font-bold text-white/60">
                No active tunnels running
              </p>
              <p className="text-[10px] text-white/30 mt-0.5">
                Select a port below to launch instantly
              </p>
            </div>
          )}
        </div>

        {/* Sleek Unified Quick Launcher */}
        <div className="p-3 bg-black/45 border-t border-white/6 flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1">
              <Zap size={11} className="text-indigo-400" />
              <span>Quick Port Launch</span>
            </span>
            <div className="flex items-center gap-1">
              {["3000", "8000", "8080", "5173"].map((p) => (
                <button
                  key={p}
                  onClick={() => setQuickPort(p)}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all ${
                    quickPort === p
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                      : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-white/30">
                PORT
              </span>
              <input
                type="number"
                value={quickPort}
                onChange={(e) => setQuickPort(e.target.value)}
                placeholder="3000"
                className="w-full bg-white/5 border border-white/8 rounded-xl pl-11 pr-3 py-1.5 text-xs font-mono font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/60 focus:bg-white/7 transition-all"
              />
            </div>
            <button
              onClick={handleQuickLaunch}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-md shadow-violet-600/25 shrink-0"
            >
              <Play size={11} className="fill-white" />
              <span>Launch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Downward Speech Bubble Pointer Arrow (Beak) */}
      <div
        style={{ left: `${arrowPos}px` }}
        className="absolute bottom-0.5 -translate-x-1/2 w-3.5 h-3.5 bg-[#0a0a0f] border-r border-b border-white/15 rotate-45 shadow-[2px_2px_6px_rgba(0,0,0,0.6)] pointer-events-none z-50 transition-all duration-150"
      />
    </div>
  );
}
