import Head from "next/head";
import { Shield, Cloud, Sun, Moon, Monitor } from "lucide-react";
import { useSettingsStore, AppSettings } from "../store/settingsStore";
import { useTunnelStore } from "../store/tunnelStore";
import { SettingToggle } from "../components/Settings/SettingToggle";
import { UpdateSection } from "../components/Settings/UpdateSection";
import { useEffect } from "react";

export default function SettingsPage() {
  const { settings, toggleSetting, updateSetting, settingItems, resetSettings } =
    useSettingsStore();
  const {
    isCloudflaredInstalled,
    isAuthenticated,
    checkCloudflared,
    checkAuth,
    loginCloudflared,
  } = useTunnelStore();

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

      <div className="relative group rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl transition-all duration-500">
        <div className="relative bg-(--glass-bg) backdrop-blur-xl border border-(--glass-border) rounded-xl sm:rounded-2xl overflow-hidden px-4 sm:px-6 py-4">
          <div className="flex flex-col gap-4">
            {settingItems.map((item, index) => {
              if (item.id === "theme" || item.id === "darkMode") {
                const currentTheme = settings.theme || (settings.darkMode === false ? "light" : "dark");
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 ${
                      index !== settingItems.length - 1 ? "border-b border-(--glass-border-light)" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-(--glass-bg) text-indigo-400 border border-(--glass-border-light) flex items-center justify-center transition-all duration-500 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <h3 className="text-sm font-bold text-(--text-main) tracking-wide">
                          {item.title}
                        </h3>
                        <p className="text-[11px] font-medium text-(--text-muted)/80">{item.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 p-1 bg-neutral-500/10 dark:bg-black/40 border border-(--glass-border-light) rounded-xl shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => {
                          updateSetting("theme", "system");
                          updateSetting("darkMode", window.matchMedia("(prefers-color-scheme: dark)").matches);
                        }}
                        title="System Theme"
                        className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center cursor-pointer outline-none ${
                          currentTheme === "system"
                            ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                            : "text-(--text-muted) hover:text-(--text-main) hover:bg-white/5"
                        }`}
                      >
                        <Monitor size={15} />
                      </button>
                      <button
                        onClick={() => {
                          updateSetting("theme", "light");
                          updateSetting("darkMode", false);
                        }}
                        title="Light Theme"
                        className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center cursor-pointer outline-none ${
                          currentTheme === "light"
                            ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                            : "text-(--text-muted) hover:text-(--text-main) hover:bg-white/5"
                        }`}
                      >
                        <Sun size={15} />
                      </button>
                      <button
                        onClick={() => {
                          updateSetting("theme", "dark");
                          updateSetting("darkMode", true);
                        }}
                        title="Dark Theme"
                        className={`w-8 h-8 rounded-lg transition-all flex items-center justify-center cursor-pointer outline-none ${
                          currentTheme === "dark"
                            ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                            : "text-(--text-muted) hover:text-(--text-main) hover:bg-white/5"
                        }`}
                      >
                        <Moon size={15} />
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <SettingToggle
                  key={item.id}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  isEnabled={settings[item.id as keyof AppSettings] as boolean}
                  onToggle={() => toggleSetting(item.id as keyof AppSettings)}
                  isLast={index === settingItems.length - 1}
                />
              );
            })}
          </div>
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
