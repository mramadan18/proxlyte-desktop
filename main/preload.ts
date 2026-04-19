import { contextBridge, ipcRenderer } from "electron";

const api = {
  // Window controls
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),
  isMaximized: () => ipcRenderer.invoke("is-window-maximized"),

  // Tunnel controls
  checkAuth: () => ipcRenderer.invoke("check-auth"),
  checkInstallation: () => ipcRenderer.invoke("check-installation"),
  login: () => ipcRenderer.invoke("cloudflared-login"),
  startQuickTunnel: (port: number) =>
    ipcRenderer.invoke("start-quick-tunnel", port),
  startCustomTunnel: (params: { domain: string; port: number }) =>
    ipcRenderer.invoke("start-custom-tunnel", params),
  stopTunnel: () => ipcRenderer.invoke("stop-tunnel"),

  // Events
  onMaximized: (callback: () => void) => {
    ipcRenderer.on("window-maximized", callback);
    return () => ipcRenderer.removeListener("window-maximized", callback);
  },
  onUnmaximized: (callback: () => void) => {
    ipcRenderer.on("window-unmaximized", callback);
    return () => ipcRenderer.removeListener("window-unmaximized", callback);
  },
  onTunnelUrl: (callback: (url: string) => void) => {
    const handler = (_event: any, url: string) => callback(url);
    ipcRenderer.on("tunnel-url", handler);
    return () => ipcRenderer.removeListener("tunnel-url", handler);
  },
  onTunnelLog: (callback: (log: string) => void) => {
    const handler = (_event: any, log: string) => callback(log);
    ipcRenderer.on("tunnel-log", handler);
    return () => ipcRenderer.removeListener("tunnel-log", handler);
  },
  onTunnelError: (callback: (error: string) => void) => {
    const handler = (_event: any, error: string) => callback(error);
    ipcRenderer.on("tunnel-error", handler);
    return () => ipcRenderer.removeListener("tunnel-error", handler);
  },

  // Storage & System
  storeGet: (key: string) => ipcRenderer.invoke("store-get", key),
  storeSet: (key: string, val: any) => ipcRenderer.invoke("store-set", key, val),
  storeDelete: (key: string) => ipcRenderer.invoke("store-delete", key),
  setLoginItem: (openAtLogin: boolean) => ipcRenderer.invoke("set-login-item", openAtLogin),
};

contextBridge.exposeInMainWorld("api", api);

export type AppApi = typeof api;
