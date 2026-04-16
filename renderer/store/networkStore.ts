import { create } from "zustand";
import { Cloud, Globe, Lock, LucideIcon } from "lucide-react";

export interface ExposureMode {
  id: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
}

interface NetworkState {
  mode: string;
  authEnabled: boolean;
  showPassword: boolean;
  exposureModes: ExposureMode[];
  setMode: (mode: string) => void;
  toggleAuth: () => void;
  toggleShowPassword: () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  mode: "quick-tunnel",
  authEnabled: false,
  showPassword: false,
  exposureModes: [
    {
      id: "local",
      icon: Lock,
      title: "Private Local",
      desc: "No external routing. Port restricted to localhost only.",
      color: "white",
    },
    {
      id: "quick-tunnel",
      icon: Cloud,
      title: "Liquid Tunnel",
      desc: "Ephemeral cloudflare deployment with auto-generated domain.",
      color: "indigo",
    },
    {
      id: "custom-domain",
      icon: Globe,
      title: "Cloud Integration",
      desc: "Enterprise domain binding with custom SSL certificate management.",
      color: "fuchsia",
    },
  ],
  setMode: (mode) => set({ mode }),
  toggleAuth: () => set((state) => ({ authEnabled: !state.authEnabled })),
  toggleShowPassword: () =>
    set((state) => ({ showPassword: !state.showPassword })),
}));
