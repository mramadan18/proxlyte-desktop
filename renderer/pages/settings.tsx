import Head from "next/head";
import { Shield } from "lucide-react";
import { useSettingsStore, AppSettings } from "../store/settingsStore";
import { SettingToggle } from "../components/Settings/SettingToggle";

export default function SettingsPage() {
  const { settings, toggleSetting, settingItems } = useSettingsStore();

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Head>
        <title>Preferences - Proxlyte</title>
      </Head>

      <div className="flex flex-col gap-1 sm:gap-1.5">
        <h1 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-br from-white to-white/60 tracking-tight">
          Preferences
        </h1>
        <p className="text-white/40 text-[12px] font-medium max-w-lg">
          Customize behavior, appearance, and systemic parameters of the application environment.
        </p>
      </div>

      <div className="relative group rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl transition-all duration-500">
        <div className="relative bg-white/2 backdrop-blur-xl border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden px-4 sm:px-6 py-4">
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
      
      <div className="relative group rounded-xl overflow-hidden shadow-2xl mt-4">
        <div className="bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 transition-all rounded-xl p-5 flex items-center justify-between cursor-pointer">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20">
                <Shield className="w-5 h-5" />
             </div>
             <div className="flex flex-col">
               <h3 className="text-sm font-bold text-red-400">Danger Zone</h3>
               <p className="text-[11px] font-medium text-red-400/50">Reset application settings or clear local cache</p>
             </div>
           </div>
           <button className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-[11px] font-bold uppercase tracking-wider hover:bg-red-500/30 transition-colors">
              Reset Config
           </button>
        </div>
      </div>
    </div>
  );
}
