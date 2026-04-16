import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Bell, Zap, RotateCcw, Monitor } from "lucide-react";

export interface AppSettings {
  startOnBoot: boolean;
  autoReconnect: boolean;
  notifications: boolean;
  darkMode: boolean;
  customDomains: string[];
}

interface SettingsState {
  settings: AppSettings;
  toggleSetting: (key: keyof AppSettings) => void;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  settingItems: any[];
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {
        startOnBoot: false,
        autoReconnect: true,
        notifications: true,
        darkMode: true,
        customDomains: [],
      },
      toggleSetting: (key) =>
        set((state) => {
          const val = state.settings[key];
          if (typeof val === "boolean") {
             return { settings: { ...state.settings, [key]: !val } };
          }
          return state;
        }),
      updateSetting: (key, value) => 
        set((state) => ({
          settings: { ...state.settings, [key]: value },
        })),
      settingItems: [
        {
          id: "startOnBoot",
          icon: Zap,
          title: "Launch on Startup",
          description: "Automatically start Proxlyte when you boot your system.",
        },
        {
          id: "autoReconnect",
          icon: RotateCcw,
          title: "Auto Request Reconnect",
          description: "Attempt to automatically re-establish broken tunnel connections.",
        },
        {
          id: "notifications",
          icon: Bell,
          title: "System Notifications",
          description: "Receive desktop alerts for connections, errors, and system events.",
        },
        {
          id: "darkMode",
          icon: Monitor,
          title: "Deep Dark Aesthetic",
          description: "Enable the premium digital obsidian interface mode.",
        },
      ],
    }),
    {
      name: "proxlyte-settings",
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
