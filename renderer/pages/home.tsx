import Head from "next/head";
import { useTunnelStore } from "../store/tunnelStore";
import { TunnelItem } from "../components/Tunnels/TunnelItem";
import { Plus, Link as LinkIcon } from "lucide-react";

export default function HomePage() {
  const { tunnels, addTunnel } = useTunnelStore();
  const activeCount = tunnels.filter((t) => t.status === "running" || t.status === "starting").length;

  return (
    <div className="flex flex-col gap-5 sm:gap-6 pb-10 min-h-full">
      <Head>
        <title>Tunnels - Proxlyte</title>
      </Head>

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-(--glass-bg) backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-(--glass-border) shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-extrabold text-transparent bg-clip-text bg-linear-to-br from-(--text-main) via-(--text-main)/90 to-(--text-main)/60 tracking-tight">
              Active Tunnels
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-500/15 text-violet-300 border border-violet-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
              {activeCount} Live / {tunnels.length} Total
            </span>
          </div>
          <p className="text-(--text-muted)/80 text-xs font-medium">
            Expose local servers to the internet with instant secure URLs.
          </p>
        </div>

        {/* Primary CTA - Always Visible at the Top */}
        <button
          onClick={addTunnel}
          className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] flex items-center justify-center gap-2 transition-all active:scale-95 text-xs sm:text-sm shrink-0 cursor-pointer group border border-white/10"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>New Tunnel</span>
        </button>
      </div>

      {/* Tunnels List Section */}
      <div className="flex flex-col gap-3.5">
        {tunnels.map((tunnel) => (
          <TunnelItem key={tunnel.id} tunnel={tunnel} />
        ))}

        {/* Empty State */}
        {tunnels.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-violet-500/20 rounded-2xl bg-(--glass-bg)/30 text-center gap-4 my-2">
            <div className="p-4 bg-violet-500/10 rounded-2xl border border-violet-500/20 text-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
              <LinkIcon size={28} />
            </div>
            <div>
              <h3 className="text-base font-bold text-(--text-main) mb-1">No Active Tunnels</h3>
              <p className="text-(--text-muted) text-xs font-medium max-w-sm mx-auto">
                You haven't exposed any local servers yet. Create your first tunnel to generate a secure public URL instantly.
              </p>
            </div>
            <button
              onClick={addTunnel}
              className="mt-1 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center gap-2 transition-all active:scale-95 text-xs sm:text-sm cursor-pointer border border-white/10 group"
            >
              <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>Create First Tunnel</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
