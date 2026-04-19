import { Globe, ShieldCheck, Copy, ExternalLink, Loader2 } from "lucide-react";
import { useTunnelStore } from "../../store/tunnelStore";

export const PublicAccessCard = () => {
  const { tunnels } = useTunnelStore();
  const runningTunnel = tunnels.find((t) => t.status === "running");
  const isRunning = !!runningTunnel;
  const publicUrl = runningTunnel?.publicUrl;
  return (
    <div className="relative group rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 h-full">
      <div
        className={`relative h-full bg-(--glass-bg) backdrop-blur-md border rounded-xl sm:rounded-2xl p-4 sm:p-5 flex flex-col gap-4 sm:gap-6 transition-colors duration-500
      ${isRunning ? "border-(--accent-fuchsia)/30" : "border-(--glass-highlight)"}
    `}
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-500
            ${isRunning ? "bg-(--accent-fuchsia)/20 text-(--accent-fuchsia) border border-(--accent-fuchsia)/30 shadow-[0_0_20px_var(--accent-fuchsia)]/20" : "bg-(--glass-highlight) text-(--text-dim) border border-(--glass-border)"}
          `}
          >
            <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-base sm:text-lg font-bold text-white leading-tight transition-all">
              Public URL
            </h3>
            <span className="text-[9px] sm:text-[10px] font-semibold text-white/40 uppercase tracking-widest mt-0.5 sm:mt-1">
              Global Exposure
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:gap-5 flex-1">
          <p className="text-xs text-(--text-muted) font-medium leading-relaxed">
            Your local service is bound to a secure public endpoint. All traffic
            is encrypted via end-to-end TLS tunnels.
          </p>

          {isRunning ? (
            <div className="flex flex-col gap-2.5 sm:gap-3 mt-auto">
              <div className="relative group/url">
                {/* Subtle animated border behind */}
                <div className="absolute -inset-0.5 bg-linear-to-r from-(--accent-secondary) via-(--accent-fuchsia) to-(--accent-secondary) rounded-lg sm:rounded-xl blur opacity-30 group-hover/url:opacity-60 transition duration-1000 group-hover/url:duration-200 animate-tilt"></div>

                <div className="relative bg-black/60 backdrop-blur-xl border border-(--glass-border) rounded-lg sm:rounded-xl p-3 sm:p-4 flex justify-between items-center transition-all duration-300">
                  <div className="flex-1 overflow-hidden pr-3 sm:pr-4">
                    <p className="text-[8px] sm:text-[9px] font-bold text-fuchsia-400 uppercase tracking-widest mb-1 flex items-center gap-1.5 sm:gap-2">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      Encrypted Route
                    </p>
                    <p className="font-mono text-[11px] sm:text-[13px] text-white truncate opacity-90 group-hover/url:opacity-100 transition-opacity flex items-center gap-2">
                      {publicUrl ? (
                        publicUrl
                      ) : (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-fuchsia-400" />
                          Generating public URL...
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-1.5">
                    <button
                      onClick={() =>
                        publicUrl && navigator.clipboard.writeText(publicUrl)
                      }
                      className="text-white/40 hover:text-white hover:bg-white/10 p-1.5 sm:p-2 rounded-lg transition-all duration-300 disabled:opacity-50"
                      disabled={!publicUrl}
                    >
                      <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        publicUrl && window.open(publicUrl, "_blank")
                      }
                      className="text-white/40 hover:text-white hover:bg-white/10 p-1.5 sm:p-2 rounded-lg transition-all duration-300 disabled:opacity-50"
                      disabled={!publicUrl}
                    >
                      <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="items-center justify-between px-1 sm:px-2 text-white/30 hidden sm:flex">
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">
                  Region: US-East
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">
                  Protocol: HTTPS
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 mt-auto flex flex-col items-center justify-center p-8 border border-dashed border-(--glass-border) rounded-3xl bg-black/20">
              <ShieldCheck className="w-10 h-10 text-(--text-extra-dim) mb-4" />
              <p className="text-(--text-muted)/60 text-xs font-bold uppercase tracking-[0.2em] mb-2">
                Endpoint Offline
              </p>
              <p className="text-[11px] text-(--text-extra-dim) text-center max-w-50">
                Initialize the connection to generate your secure public URL.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
