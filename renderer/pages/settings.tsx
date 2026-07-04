import Head from "next/head";
import { Shield, Cloud, Sun, Moon, Monitor, Plus, Hash } from "lucide-react";
import { useSettingsStore, AppSettings } from "../store/settingsStore";
import { useTunnelStore } from "../store/tunnelStore";
import { SettingToggle } from "../components/Settings/SettingToggle";
import { UpdateSection } from "../components/Settings/UpdateSection";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const {
    settings,
    toggleSetting,
    updateSetting,
    settingItems,
    resetSettings,
  } = useSettingsStore();
  const {
    isCloudflaredInstalled,
    isAuthenticated,
    checkCloudflared,
    checkAuth,
    loginCloudflared,
  } = useTunnelStore();

  const currentTheme =
    settings.theme || (settings.darkMode === false ? "light" : "dark");
  const [newPort, setNewPort] = useState("");

  const handleAddPort = () => {
    const port = newPort.trim();
    if (port && /^\d+$/.test(port) && !settings.customPorts?.includes(port)) {
      updateSetting("customPorts", [...(settings.customPorts || []), port]);
      setNewPort("");
    }
  };

  const handleRemovePort = (portToRemove: string) => {
    updateSetting(
      "customPorts",
      (settings.customPorts || []).filter((p) => p !== portToRemove),
    );
  };

  useEffect(() => {
    checkCloudflared();
    checkAuth();
  }, [checkCloudflared, checkAuth]);

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Head>
        <title>Preferences - Proxlyte</title>
      </Head>

      <div className="flex flex-col gap-1 sm:gap-1.5">
        <h1 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-br from-(--text-main) via-(--text-main)/90 to-(--text-main)/60 tracking-tight">
          Preferences
        </h1>
        <p className="text-(--text-muted) text-[12px] font-medium max-w-lg">
          Customize behavior, appearance, and systemic parameters of the
          application environment.
        </p>
      </div>

      {/* Interface Appearance Card */}
      <div className="relative group rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl transition-all duration-500">
        <div className="relative bg-(--glass-bg) backdrop-blur-xl border border-(--glass-border) rounded-xl sm:rounded-2xl overflow-hidden px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-(--glass-bg) text-indigo-400 border border-(--glass-border-light) flex items-center justify-center transition-all duration-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                <Monitor className="w-5 h-5" />
              </div>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-sm font-bold text-(--text-main) tracking-wide">
                  Interface Appearance
                </h3>
                <p className="text-[11px] font-medium text-(--text-muted)/80">
                  Select your preferred visual theme: System default, Light
                  mode, or Dark mode.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1.5 bg-neutral-500/10 dark:bg-black/40 border border-(--glass-border-light) rounded-xl shrink-0 self-end sm:self-auto">
              <button
                onClick={() => {
                  updateSetting("theme", "system");
                  updateSetting(
                    "darkMode",
                    window.matchMedia("(prefers-color-scheme: dark)").matches,
                  );
                }}
                title="System Theme"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer outline-none ${
                  currentTheme === "system"
                    ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                    : "text-(--text-muted) hover:text-(--text-main) hover:bg-white/5"
                }`}
              >
                <Monitor size={14} />
                <span>System</span>
              </button>
              <button
                onClick={() => {
                  updateSetting("theme", "light");
                  updateSetting("darkMode", false);
                }}
                title="Light Theme"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer outline-none ${
                  currentTheme === "light"
                    ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                    : "text-(--text-muted) hover:text-(--text-main) hover:bg-white/5"
                }`}
              >
                <Sun size={14} />
                <span>Light</span>
              </button>
              <button
                onClick={() => {
                  updateSetting("theme", "dark");
                  updateSetting("darkMode", true);
                }}
                title="Dark Theme"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer outline-none ${
                  currentTheme === "dark"
                    ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                    : "text-(--text-muted) hover:text-(--text-main) hover:bg-white/5"
                }`}
              >
                <Moon size={14} />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* General Toggle Settings Card */}
      <div className="relative group rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl transition-all duration-500">
        <div className="relative bg-(--glass-bg) backdrop-blur-xl border border-(--glass-border) rounded-xl sm:rounded-2xl overflow-hidden px-4 sm:px-6 py-4">
          <div className="flex flex-col gap-4">
            {settingItems.map((item, index) => (
              <SettingToggle
                key={item.id}
                icon={item.icon}
                title={item.title}
                description={item.description}
                isEnabled={settings[item.id as keyof AppSettings] as boolean}
                onToggle={() => toggleSetting(item.id as keyof AppSettings)}
                isLast={index === settingItems.length - 1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Custom Ports Card */}
      <div className="relative group rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl transition-all duration-500">
        <div className="relative bg-(--glass-bg) backdrop-blur-xl border border-(--glass-border) rounded-xl sm:rounded-2xl overflow-hidden px-4 sm:px-6 py-5 flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Hash className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-bold text-(--text-main) tracking-wide">
                Custom Port Suggestions
              </h3>
              <p className="text-[11px] font-medium text-(--text-muted)/60">
                Manage the port numbers that appear as suggestions in the tunnel
                creation panel.
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full mt-2">
            <input
              type="text"
              value={newPort}
              onChange={(e) => setNewPort(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddPort()}
              placeholder="e.g. 8080"
              className="px-4 rounded-xl text-sm outline-none transition-all h-10 border bg-black/5 dark:bg-white/5 text-(--text-main) border-(--glass-border-light) hover:border-(--glass-border) focus:border-emerald-500/50 flex-1 min-w-0"
            />
            <button
              onClick={handleAddPort}
              disabled={!newPort.trim() || !/^\d+$/.test(newPort.trim())}
              className="flex items-center gap-2 px-6 rounded-xl text-sm font-bold transition-all h-10 bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-500/20 shrink-0 cursor-pointer"
            >
              <Plus size={16} />
              Add Port
            </button>
          </div>

          {(settings.customPorts?.length || 0) > 0 && (
            <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-black/5 dark:border-white/5">
              <h4 className="text-[10px] font-bold text-(--text-muted)/40 uppercase tracking-wider mb-1">
                Your Saved Ports
              </h4>
              <div className="flex flex-wrap gap-2">
                {settings.customPorts?.map((port) => (
                  <div
                    key={port}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 dark:bg-white/5 border border-(--glass-border-light) rounded-xl hover:border-black/25 dark:hover:border-white/20 transition-colors"
                  >
                    <span className="text-xs font-semibold text-(--text-main)/80 select-all">
                      {port}
                    </span>
                    <button
                      onClick={() => handleRemovePort(port)}
                      className="p-0.5 rounded-lg text-rose-500/60 hover:bg-rose-500/10 hover:text-rose-500 transition-colors cursor-pointer"
                      title={`Remove port ${port}`}
                    >
                      <Plus size={12} className="rotate-45" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <UpdateSection />

      <div className="relative group rounded-xl overflow-hidden shadow-2xl mt-4">
        <div className="bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10 hover:border-blue-500/20 transition-all rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-blue-400">
                Cloudflare Account
              </h3>
              <p className="text-[11px] font-medium text-blue-400/50">
                {!isCloudflaredInstalled
                  ? "Cloudflared installation not found. Please install the CLI."
                  : isAuthenticated
                    ? "Status: Authenticated. Your account is linked."
                    : "Cloudflared is installed. Login to link your account."}
              </p>
            </div>
          </div>
          <button
            onClick={() => loginCloudflared()}
            disabled={!isCloudflaredInstalled || isAuthenticated}
            className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors ${
              isAuthenticated
                ? "bg-emerald-500/20 text-emerald-400 cursor-default"
                : isCloudflaredInstalled
                  ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                  : "bg-gray-500/20 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isAuthenticated ? "Authenticated" : "Login to Cloudflare"}
          </button>
        </div>
      </div>

      <div className="relative group rounded-xl overflow-hidden shadow-2xl mt-4">
        <div className="bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 transition-all rounded-xl p-5 flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-red-400">Danger Zone</h3>
              <p className="text-[11px] font-medium text-red-400/50">
                Reset application settings or clear local cache
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm("Are you sure you want to reset all settings?")) {
                resetSettings();
              }
            }}
            className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-[11px] font-bold uppercase tracking-wider hover:bg-red-500/30 transition-colors"
          >
            Reset Config
          </button>
        </div>
      </div>
    </div>
  );
}
