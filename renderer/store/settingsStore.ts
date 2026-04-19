import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Bell, Zap, RotateCcw, Monitor } from "lucide-react";

const electronStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof window === "undefined" || !window.api) return null;
    const value = await window.api.storeGet(name);
    return value ? value : null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window !== "undefined" && window.api) {
      await window.api.storeSet(name, value);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof window !== "undefined" && window.api) {
      await window.api.storeDelete(name);
    }
  },
};

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
  updateSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => void;
  resetSettings: () => void;
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
            const newVal = !val;
            if (
              key === "startOnBoot" &&
              typeof window !== "undefined" &&
              window.api
            ) {
              window.api.setLoginItem(newVal);
            }
            return { settings: { ...state.settings, [key]: newVal } };
          }
          return state;
        }),
      updateSetting: (key, value) =>
        set((state) => {
          if (
            key === "startOnBoot" &&
            typeof window !== "undefined" &&
            window.api
          ) {
            window.api.setLoginItem(value as boolean);
          }
          return {
            settings: { ...state.settings, [key]: value },
          };
        }),
      settingItems: [
        {
          id: "startOnBoot",
          icon: Zap,
          title: "Launch on Startup",
          description:
            "Automatically start Proxlyte when you boot your system.",
        },
        {
          id: "autoReconnect",
          icon: RotateCcw,
          title: "Auto Request Reconnect",
          description:
            "Attempt to automatically re-establish broken tunnel connections.",
        },
        {
          id: "notifications",
          icon: Bell,
          title: "System Notifications",
          description:
            "Receive desktop alerts for connections, errors, and system events.",
        },
        {
          id: "darkMode",
          icon: Monitor,
          title: "Deep Dark Aesthetic",
          description: "Enable the premium digital obsidian interface mode.",
        },
      ],
      resetSettings: () =>
        set({
          settings: {
            startOnBoot: false,
            autoReconnect: true,
            notifications: true,
            darkMode: true,
            customDomains: [],
          },
        }),
    }),
    {
      name: "proxlyte-settings",
      storage: createJSONStorage(() => electronStorage),
      partialize: (state) => ({ settings: state.settings }),
    },
  ),
);
