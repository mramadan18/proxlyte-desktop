import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Bell, Zap, RotateCcw, Monitor, Minimize2, EyeOff } from "lucide-react";

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
  theme?: "system" | "light" | "dark";
  minimizeToTray: boolean;
  closeToTray: boolean;
  customDomains: string[];
}

const defaultSettings: AppSettings = {
  startOnBoot: false,
  autoReconnect: true,
  notifications: true,
  darkMode: true,
  theme: "dark",
  minimizeToTray: true,
  closeToTray: true,
  customDomains: [],
};

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
      settings: { ...defaultSettings },
      toggleSetting: (key: keyof AppSettings) =>
        set((state: SettingsState) => {
          const val = state.settings[key] !== undefined ? state.settings[key] : defaultSettings[key];
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
      updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
        set((state: SettingsState) => {
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
          id: "theme",
          icon: Monitor,
          title: "Interface Appearance",
          description:
            "Select your preferred visual theme: System default, Light mode, or Dark mode.",
        },
        {
          id: "minimizeToTray",
          icon: Minimize2,
          title: "Minimize to Tray",
          description:
            "Hide the window to system tray when minimized instead of taskbar.",
        },
        {
          id: "closeToTray",
          icon: EyeOff,
          title: "Close to Tray",
          description:
            "Hide to system tray instead of quitting when you close the window.",
        },
      ],
      resetSettings: () =>
        set({
          settings: { ...defaultSettings },
        }),
    }),
    {
      name: "proxlyte-settings",
      storage: createJSONStorage(() => electronStorage),
      partialize: (state) => ({ settings: state.settings }),
      merge: (persistedState: any, currentState: any) => {
        const persistedSettings = (persistedState as any)?.settings || {};
        return {
          ...currentState,
          ...persistedState,
          settings: {
            ...currentState.settings,
            ...persistedSettings,
          },
        };
      },
    },
  ),
);
