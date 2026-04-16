import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Bell, Zap, RotateCcw, Monitor } from "lucide-react";

export interface AppSettings {
  startOnBoot: boolean;
  autoReconnect: boolean;
  notifications: boolean;
  darkMode: boolean;
}

interface SettingsState {
  settings: AppSettings;
  toggleSetting: (key: keyof AppSettings) => void;
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
      },
      toggleSetting: (key) =>
        set((state) => ({
          settings: { ...state.settings, [key]: !state.settings[key] },
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
