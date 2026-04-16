import Head from "next/head";
import { StatusCard } from "../components/Dashboard/StatusCard";
import { PublicAccessCard } from "../components/Dashboard/PublicAccessCard";

import { useServerStore } from "../store/serverStore";

export default function HomePage() {
  const { isRunning } = useServerStore();
  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-10">
      <Head>
        <title>Dashboard - Proxlyte</title>
      </Head>

      <div className="flex flex-col gap-1 sm:gap-1.5">
        <h1 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-br from-(--text-main) to-(--text-main)/60 tracking-tight">
          Overview
        </h1>
        <p className="text-(--text-muted)/80 text-xs font-medium max-w-md">
          Manage your active tunnels and monitor real-time connection health
          across your network.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start auto-rows-max">
        <div className="flex flex-col gap-6">
          <StatusCard />
        </div>
        <div className="flex flex-col gap-6">
          <PublicAccessCard />

          {/* Placeholder for future Bento items */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-(--glass-bg) border border-(--glass-highlight) rounded-xl sm:rounded-2xl p-4 sm:p-5 backdrop-blur-md flex flex-col justify-between aspect-square">
              <p className="text-[9px] sm:text-[10px] font-bold text-(--text-muted) uppercase tracking-widest">
                Data Transferred
              </p>
              <div>
                <p className="text-xl sm:text-2xl font-light text-(--text-main)">
                  {isRunning ? "1.2" : "0"}{" "}
                  <span className="text-xs sm:text-sm text-(--text-muted)">
                    GB
                  </span>
                </p>
              </div>
            </div>
            <div className="bg-(--glass-bg) border border-(--glass-highlight) rounded-xl sm:rounded-2xl p-4 sm:p-5 backdrop-blur-md flex flex-col justify-between aspect-square">
              <p className="text-[9px] sm:text-[10px] font-bold text-(--text-muted) uppercase tracking-widest">
                Active Requests
              </p>
              <div>
                <p className="text-xl sm:text-2xl font-light text-(--text-main)">
                  {isRunning ? "42" : "0"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
