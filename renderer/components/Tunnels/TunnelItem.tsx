import { useRouter } from "next/router";
import { useTunnelStore, Tunnel } from "../../store/tunnelStore";
import { useSettingsStore } from "../../store/settingsStore";
import {
  Play,
  Square,
  Trash2,
  Link as LinkIcon,
  Copy,
} from "lucide-react";

export function TunnelItem({ tunnel }: { tunnel: Tunnel }) {
  const { updateTunnel, removeTunnel, toggleTunnelStatus } = useTunnelStore();

  const isRunning = tunnel.status === "running";

  const handleCopyLink = () => {
    if (tunnel.publicUrl) {
      navigator.clipboard.writeText(tunnel.publicUrl);
    }
  };

  const { settings } = useSettingsStore();
  const customDomains = settings.customDomains || [];
  const router = useRouter();

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center gap-4 transition-all duration-300 ${
        isRunning
          ? "bg-(--glass-bg) border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.08)]"
          : "bg-(--glass-bg) border border-(--glass-highlight)"
      }`}
    >
      {isRunning ? (
        <>
          {/* === RUNNING STATE UI === */}
          <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-3 min-w-0">
            {/* Live Badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold shrink-0">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              Live on Port {tunnel.port || "3000"}
            </div>

            <div className="hidden sm:flex text-(--text-muted)/50">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>

            {/* Public URL Display */}
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium flex-1 min-w-0 transition-colors">
              <LinkIcon size={14} className="shrink-0" />
              <span className="truncate select-all" title={tunnel.publicUrl}>
                {tunnel.publicUrl?.replace("https://", "")}
              </span>
              <button
                onClick={handleCopyLink}
                className="p-1.5 hover:bg-emerald-400/20 rounded-md transition-colors shrink-0"
                title="Copy link"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
            <button
              onClick={() => toggleTunnelStatus(tunnel.id)}
              className="flex items-center justify-center gap-2 px-6 h-10 rounded-xl text-sm font-bold transition-all w-full sm:w-auto bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)] hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]"
            >
              <Square size={14} fill="currentColor" />
              Stop
            </button>
          </div>
        </>
      ) : (
        <>
          {/* === STOPPED STATE UI === */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Local Port (e.g. 3000)"
              value={tunnel.port}
              onChange={(e) =>
                updateTunnel(tunnel.id, { port: e.target.value })
              }
              className="w-full px-4 rounded-xl text-sm outline-none transition-all h-10 border bg-white/5 text-(--text-main) border-white/10 hover:border-white/20 focus:border-emerald-500/50 focus:bg-white/10"
            />

            <div className="flex gap-2 w-full">
              <select
                value={tunnel.domainType}
                onChange={(e) =>
                  updateTunnel(tunnel.id, {
                    domainType: e.target.value as "random" | "custom",
                    baseDomain:
                      e.target.value === "custom" ? customDomains[0] || "" : "",
                  })
                }
                className="px-3 rounded-xl text-sm outline-none transition-all h-10 border bg-white/5 text-(--text-main) border-white/10 hover:border-white/20 focus:border-emerald-500/50 appearance-none basis-2/5 min-w-[140px] cursor-pointer"
              >
                <option value="random" className="bg-neutral-900">
                  Random Link
                </option>
                <option value="custom" className="bg-neutral-900">
                  Custom Domain
                </option>
              </select>

              {tunnel.domainType === "custom" && customDomains.length > 0 && (
                <div className="flex-1 flex items-center border border-white/10 rounded-xl bg-white/5 overflow-hidden focus-within:border-emerald-500/50 focus-within:bg-white/10 transition-all h-10">
                  <input
                    type="text"
                    placeholder="app"
                    value={tunnel.subdomain}
                    onChange={(e) =>
                      updateTunnel(tunnel.id, { subdomain: e.target.value })
                    }
                    className="w-full px-3 text-sm outline-none bg-transparent text-(--text-main) text-right placeholder-neutral-500 min-w-0"
                  />
                  <span className="text-(--text-muted) px-1 text-sm font-medium">
                    .
                  </span>
                  <select
                    value={tunnel.baseDomain}
                    onChange={(e) =>
                      updateTunnel(tunnel.id, { baseDomain: e.target.value })
                    }
                    className="pr-3 pl-1 text-sm outline-none bg-transparent text-(--text-main) font-medium appearance-none cursor-pointer max-w-[110px] sm:max-w-[130px] truncate"
                  >
                    {customDomains.map((d) => (
                      <option key={d} value={d} className="bg-neutral-900">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {tunnel.domainType === "custom" && customDomains.length === 0 && (
                <button
                  onClick={() => router.push("/domains")}
                  className="flex-1 px-4 rounded-xl text-sm font-medium transition-all h-10 border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 whitespace-nowrap overflow-hidden text-ellipsis text-left flex items-center justify-between group"
                >
                  Setup Domain
                  <span className="ml-2 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
            <button
              onClick={() => toggleTunnelStatus(tunnel.id)}
              className="flex items-center justify-center gap-2 px-6 h-10 rounded-xl text-sm font-bold transition-all w-full sm:w-auto bg-white/5 text-(--text-main) border border-white/10 hover:bg-white/10 hover:border-emerald-500/30"
            >
              <Play size={14} fill="currentColor" />
              Publish
            </button>

            <button
              onClick={() => removeTunnel(tunnel.id)}
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
