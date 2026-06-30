import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

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

export interface Tunnel {
  id: string;
  port: string;
  protocol?: string;
  domainType: "random" | "custom";
  subdomain: string;
  baseDomain: string;
  status: "stopped" | "running" | "starting" | "error";
  publicUrl?: string;
}

interface TunnelState {
  tunnels: Tunnel[];
  isCloudflaredInstalled: boolean;
  isAuthenticated: boolean;
  addTunnel: () => void;
  updateTunnel: (id: string, data: Partial<Tunnel>) => void;
  removeTunnel: (id: string) => void;
  toggleTunnelStatus: (id: string) => Promise<void>;
  setupListeners: () => void;
  checkCloudflared: () => Promise<void>;
  checkAuth: () => Promise<void>;
  loginCloudflared: () => Promise<void>;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useTunnelStore = create<TunnelState>()(
  persist(
    (set, get) => ({
      isCloudflaredInstalled: false,
      isAuthenticated: false,
      tunnels: [
        {
          id: "default",
          port: "3000",
          protocol: "http",
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
              protocol: "http",
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

      setupListeners: () => {
        if (typeof window !== "undefined" && window.api) {
          window.api.onTunnelUrl((tunnelId: string, url: string) => {
            get().updateTunnel(tunnelId, {
              status: "running",
              publicUrl: url,
            });
          });
          window.api.onTunnelError((tunnelId: string, error: string) => {
            get().updateTunnel(tunnelId, { status: "error" });
          });
          get().checkCloudflared();
          get().checkAuth();
        }
      },

      checkCloudflared: async () => {
        if (
          typeof window !== "undefined" &&
          window.api &&
          window.api.checkInstallation
        ) {
          const isInstalled = await window.api.checkInstallation();
          set({ isCloudflaredInstalled: isInstalled });
        }
      },

      checkAuth: async () => {
        if (
          typeof window !== "undefined" &&
          window.api &&
          window.api.checkAuth
        ) {
          const auth = await window.api.checkAuth();
          set({ isAuthenticated: auth });
        }
      },

      loginCloudflared: async () => {
        if (typeof window !== "undefined" && window.api && window.api.login) {
          await window.api.login();
          await get().checkCloudflared();
          await get().checkAuth();
        }
      },

      toggleTunnelStatus: async (id) => {
        const { tunnels, updateTunnel } = get();
        const tunnel = tunnels.find((t) => t.id === id);
        if (!tunnel) return;

        const nextStatus =
          tunnel.status === "running" || tunnel.status === "starting"
            ? "stopped"
            : "starting";

        if (typeof window !== "undefined" && window.api) {
          if (nextStatus === "starting") {
            updateTunnel(id, { status: "starting", publicUrl: undefined }); // Optimistic UI update

            try {
              const portNum = parseInt(tunnel.port, 10) || 3000;
              if (tunnel.domainType === "custom" && tunnel.baseDomain) {
                const fullDomain = tunnel.subdomain
                  ? `${tunnel.subdomain}.${tunnel.baseDomain}`
                  : tunnel.baseDomain;
                await window.api.startCustomTunnel(id, {
                  domain: fullDomain,
                  port: portNum,
                });
              } else {
                await window.api.startQuickTunnel(id, portNum);
              }
            } catch (error) {
              updateTunnel(id, { status: "error", publicUrl: undefined });
            }
          } else {
            await window.api.stopTunnel(id);
            updateTunnel(id, { status: "stopped", publicUrl: undefined });
          }
        } else {
          // Fallback logic for web dev
          let finalUrl = undefined;
          if (nextStatus === "starting") {
            if (tunnel.domainType === "custom" && tunnel.baseDomain) {
              finalUrl = `https://${tunnel.subdomain ? tunnel.subdomain + "." : ""}${tunnel.baseDomain}`;
            } else {
              finalUrl = `https://proxlyte-${Math.floor(Math.random() * 10000)}.trycloudflare.com`;
            }
            updateTunnel(id, { status: "running", publicUrl: finalUrl });
          } else {
            updateTunnel(id, { status: nextStatus, publicUrl: finalUrl });
          }
        }
      },
    }),
    {
      name: "proxlyte-tunnels",
      storage: createJSONStorage(() => electronStorage),
    },
  ),
);
