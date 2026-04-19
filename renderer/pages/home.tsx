import Head from "next/head";
import { useTunnelStore } from "../store/tunnelStore";
import { TunnelItem } from "../components/Tunnels/TunnelItem";
import { TrafficChart } from "../components/Dashboard/TrafficChart";
import { Plus, Link as LinkIcon } from "lucide-react";

export default function HomePage() {
  const { tunnels, addTunnel } = useTunnelStore();

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-10 min-h-full">
      <Head>
        <title>Tunnels - Proxlyte</title>
      </Head>

      <div className="flex flex-col gap-1 sm:gap-1.5">
        <h1 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-br from-(--text-main) to-(--text-main)/60 tracking-tight">
          Active Tunnels
        </h1>
        <p className="text-(--text-muted)/80 text-xs font-medium max-w-md">
          Expose your local servers to the internet instantly. Add multiple
          tunnels to manage all your active connections from one place.
        </p>
      </div>

      <TrafficChart />

      <div className="flex flex-col gap-4">
        {tunnels.map((tunnel) => (
          <TunnelItem key={tunnel.id} tunnel={tunnel} />
        ))}

        {tunnels.length === 0 && (
          <div className="flex flex-col items-center justify-center p-10 border border-dashed border-(--glass-highlight) rounded-2xl bg-(--glass-bg)/50 text-center gap-3">
            <div className="p-3 bg-white/5 rounded-full">
              <LinkIcon size={24} className="text-(--text-muted)" />
            </div>
            <p className="text-(--text-muted) text-sm font-medium">
              No tunnels active. Click to add your first tunnel.
            </p>
          </div>
        )}

        <button
          onClick={addTunnel}
          className="w-full relative group mt-2 overflow-hidden rounded-2xl p-px transition-all"
        >
          {/* Subtle gradient border effect */}
          <span className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent group-hover:via-white/20 transition-all duration-500 rounded-2xl" />

          <div className="relative flex items-center justify-center gap-2 w-full h-14 bg-black/40 backdrop-blur-sm rounded-2xl text-(--text-muted) hover:text-(--text-main) transition-colors border border-white/5 group-hover:bg-white/3">
            <Plus
              size={18}
              className="transition-transform group-hover:scale-110"
            />
            <span className="font-semibold tracking-wider text-sm">
              ADD NEW TUNNEL
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
