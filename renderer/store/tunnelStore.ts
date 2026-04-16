import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Tunnel {
  id: string;
  port: string;
  domainType: "random" | "custom";
  subdomain: string;
  baseDomain: string;
  status: "stopped" | "running";
  publicUrl?: string;
}

interface TunnelState {
  tunnels: Tunnel[];
  addTunnel: () => void;
  updateTunnel: (id: string, data: Partial<Tunnel>) => void;
  removeTunnel: (id: string) => void;
  toggleTunnelStatus: (id: string) => Promise<void>;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useTunnelStore = create<TunnelState>()(
  persist(
    (set, get) => ({
      tunnels: [
        {
          id: generateId(),
          port: "3000",
          domainType: "random",
          subdomain: "",
          baseDomain: "",
          status: "stopped",
        },
      ],

      addTunnel: () => {
        set((state) => ({
          tunnels: [
            ...state.tunnels,
            {
              id: generateId(),
              port: "8080",
              domainType: "random",
              subdomain: "",
              baseDomain: "",
              status: "stopped",
            },
          ],
        }));
      },

      updateTunnel: (id, data) => {
        set((state) => ({
          tunnels: state.tunnels.map((t) =>
            t.id === id ? { ...t, ...data } : t,
          ),
        }));
      },

      removeTunnel: (id) => {
        set((state) => ({
          tunnels: state.tunnels.filter((t) => t.id !== id),
        }));
      },

      toggleTunnelStatus: async (id) => {
        const { tunnels, updateTunnel } = get();
        const tunnel = tunnels.find((t) => t.id === id);
        if (!tunnel) return;

        const nextStatus = tunnel.status === "running" ? "stopped" : "running";

        // Compute URL based on domain type (UI logic)
        let finalUrl = undefined;
        if (nextStatus === "running") {
          if (tunnel.domainType === "custom" && tunnel.baseDomain) {
            finalUrl = `https://${tunnel.subdomain ? tunnel.subdomain + "." : ""}${tunnel.baseDomain}`;
          } else {
            finalUrl = `https://proxlyte-${Math.floor(Math.random() * 10000)}.trycloudflare.com`;
          }
        }

        if (typeof window !== "undefined" && window.api) {
          if (nextStatus === "running") {
            // In the future we will pass tunnel data here
            await window.api.startServer();
            updateTunnel(id, { status: "running", publicUrl: finalUrl });
          } else {
            await window.api.stopServer();
            updateTunnel(id, { status: "stopped", publicUrl: undefined });
          }
        } else {
          // Fallback logic for web dev
          updateTunnel(id, { status: nextStatus, publicUrl: finalUrl });
        }
      },
    }),
    {
      name: "proxlyte-tunnels",
    },
  ),
);
