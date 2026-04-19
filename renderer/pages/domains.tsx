import Head from "next/head";
import { Globe, Plus, Trash2 } from "lucide-react";
import { useSettingsStore } from "../store/settingsStore";
import { useState } from "react";

export default function DomainsPage() {
  const { settings, updateSetting } = useSettingsStore();
  const [newDomain, setNewDomain] = useState("");

  const handleAddDomain = () => {
    const domain = newDomain.trim().toLowerCase();
    if (domain && !settings.customDomains?.includes(domain)) {
      updateSetting("customDomains", [...(settings.customDomains || []), domain]);
      setNewDomain("");
    }
  };

  const handleRemoveDomain = (domainToRemove: string) => {
    updateSetting(
      "customDomains",
      (settings.customDomains || []).filter((d) => d !== domainToRemove)
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Head>
        <title>Domains - Proxlyte</title>
      </Head>

      <div className="flex flex-col gap-1 sm:gap-1.5">
        <h1 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-br from-(--text-main) to-(--text-main)/60 tracking-tight">
          Custom Domains
        </h1>
        <p className="text-(--text-muted)/80 text-[12px] font-medium max-w-lg">
          Manage your base domains for exposing tunnels (e.g. example.com).
        </p>
      </div>

      <div className="relative group rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl transition-all duration-500">
        <div className="relative bg-(--glass-bg) backdrop-blur-xl border border-(--glass-border) rounded-xl sm:rounded-2xl overflow-hidden px-4 sm:px-6 py-5 flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-bold text-(--text-main) tracking-wide">
                Add Base Domain
              </h3>
              <p className="text-[11px] font-medium text-(--text-muted)/60">
                This will be available as an option when creating new tunnels.
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full mt-2">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddDomain()}
              placeholder="e.g. example.com"
              className="px-4 rounded-xl text-sm outline-none transition-all h-10 border bg-white/5 text-(--text-main) border-white/10 hover:border-white/20 focus:border-emerald-500/50 focus:bg-white/10 flex-1 min-w-0"
            />
            <button
              onClick={handleAddDomain}
              disabled={!newDomain.trim()}
              className="flex items-center gap-2 px-6 rounded-xl text-sm font-bold transition-all h-10 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-500/20 shrink-0"
            >
              <Plus size={16} />
              Add Domain
            </button>
          </div>

          {(settings.customDomains?.length || 0) > 0 && (
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/5">
              <h4 className="text-xs font-semibold text-(--text-muted)/50 uppercase tracking-widest mb-1">
                Your Base Domains
              </h4>
              {settings.customDomains?.map((domain) => (
                <div
                  key={domain}
                  className="flex flex-row items-center justify-between px-4 py-3 bg-black/20 border border-white/5 rounded-xl group hover:border-white/10 transition-colors"
                >
                  <span className="text-sm font-medium text-(--text-main)/80 select-all">
                    {domain}
                  </span>
                  <button
                    onClick={() => handleRemoveDomain(domain)}
                    className="p-1.5 rounded-lg text-rose-500/60 hover:bg-rose-500/10 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Remove domain"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
