import Link from "next/link";
import { useRouter } from "next/router";
import { Settings, Terminal, Activity, Zap, Cloud } from "lucide-react";
import { useServerStore } from "../../store/serverStore";
import { useTunnelStore } from "../../store/tunnelStore";

export function Sidebar() {
  const { serverStatus } = useServerStore();
  const { tunnels } = useTunnelStore();
  const router = useRouter();

  const isAnyTunnelRunning = tunnels.some((t) => t.status === "running");
  const overallStatus = isAnyTunnelRunning ? "running" : serverStatus;

  const tabs = [
    { id: "dashboard", label: "Overview", icon: Activity, href: "/home" },
    { id: "domains", label: "Domains", icon: Cloud, href: "/domains" },
    { id: "logs", label: "Console", icon: Terminal, href: "/logs" },
    { id: "settings", label: "Preferences", icon: Settings, href: "/settings" },
  ];

  const activeTab =
    tabs.find((tab) => tab.href === router.pathname)?.id || "dashboard";

  return (
    <aside className="w-full md:w-48 bg-(--glass-bg) backdrop-blur-2xl border border-(--glass-border) rounded-xl sm:rounded-2xl flex flex-col shrink-0 shadow-2xl relative overflow-hidden">
      {/* Subtle inner top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent"></div>

      <div className="px-4 py-4 flex items-center border-b border-(--glass-highlight) [-webkit-app-region:drag]">
        <div className="relative mr-2.5 group">
          <img
            src="/images/logo-with-bg.png"
            alt="Proxlyte Logo"
            className={`w-8 h-8 rounded-lg shadow-lg border border-white/10 transition-all duration-700
            ${overallStatus === "running" ? "brightness-110 contrast-110" : "grayscale opacity-50"}`}
          />
          {overallStatus === "running" && (
            <div className="absolute inset-0 rounded-lg bg-(--accent-secondary)/20 blur-md -z-10 animate-pulse"></div>
          )}
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-br from-white to-white/50 leading-none">
            Proxlyte
          </h1>
          <div className="flex items-center gap-1 mt-0.5">
            <span
              className={`w-1 h-1 rounded-full ${overallStatus === "running" ? "bg-success shadow-[0_0_8px_var(--color-success)]" : "bg-danger"}`}
            ></span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-(--text-dim)">
              {overallStatus === "running" ? "Active" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2.5 py-4 space-y-1 [-webkit-app-region:no-drag]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`relative w-full flex items-center justify-start px-3 py-2 rounded-lg transition-all duration-300 outline-none group overflow-hidden
                  ${
                    isActive
                      ? "bg-(--glass-highlight) text-(--text-main) border border-(--glass-border-light) shadow-sm"
                      : "text-(--text-muted) hover:text-(--text-main) hover:bg-(--glass-bg) border border-transparent"
                  }
                `}
            >
              {isActive && (
                <div className="absolute inset-0 bg-linear-to-r from-indigo-500/10 to-transparent opacity-50"></div>
              )}
              <Icon
                className={`relative z-10 w-3.5 h-3.5 mr-2.5 transition-colors duration-300 ${isActive ? "text-(--accent-indigo)" : "group-hover:text-(--text-main)/80"}`}
              />
              <span className="relative z-10 text-[11px] font-semibold tracking-wide">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 mt-auto">
        <div className="p-4 rounded-xl bg-black/20 border border-(--glass-highlight) flex items-center gap-3 backdrop-blur-md">
          <Zap className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
          <div>
            <p className="text-[9px] font-bold text-(--text-muted)/80 uppercase tracking-widest">
              Plan
            </p>
            <p className="text-[11px] font-semibold text-(--text-main)">
              Pro Edition
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
