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
  startQuickTunnel: (tunnelId: string, port: number) =>
    ipcRenderer.invoke("start-quick-tunnel", tunnelId, port),
  startCustomTunnel: (
    tunnelId: string,
    params: { domain: string; port: number },
  ) => ipcRenderer.invoke("start-custom-tunnel", tunnelId, params),
  stopTunnel: (tunnelId: string) => ipcRenderer.invoke("stop-tunnel", tunnelId),
  getActiveTunnels: () => ipcRenderer.invoke("get-active-tunnels"),

  // Events
  onMaximized: (callback: () => void) => {
    ipcRenderer.on("window-maximized", callback);
    return () => ipcRenderer.removeListener("window-maximized", callback);
  },
  onUnmaximized: (callback: () => void) => {
    ipcRenderer.on("window-unmaximized", callback);
    return () => ipcRenderer.removeListener("window-unmaximized", callback);
  },
  onTunnelUrl: (callback: (tunnelId: string, url: string) => void) => {
    const handler = (_event: any, tunnelId: string, url: string) =>
      callback(tunnelId, url);
    ipcRenderer.on("tunnel-url", handler);
    return () => ipcRenderer.removeListener("tunnel-url", handler);
  },
  onTunnelLog: (callback: (tunnelId: string, log: string) => void) => {
    const handler = (_event: any, tunnelId: string, log: string) =>
      callback(tunnelId, log);
    ipcRenderer.on("tunnel-log", handler);
    return () => ipcRenderer.removeListener("tunnel-log", handler);
  },
  onTunnelError: (callback: (tunnelId: string, error: string) => void) => {
    const handler = (_event: any, tunnelId: string, error: string) =>
      callback(tunnelId, error);
    ipcRenderer.on("tunnel-error", handler);
    return () => ipcRenderer.removeListener("tunnel-error", handler);
  },
  onTrafficData: (callback: (download: number, upload: number) => void) => {
    const handler = (_event: any, download: number, upload: number) =>
      callback(download, upload);
    ipcRenderer.on("traffic-data", handler);
    return () => ipcRenderer.removeListener("traffic-data", handler);
  },
  onTrafficRequest: (callback: (log: any) => void) => {
    const handler = (_event: any, log: any) => callback(log);
    ipcRenderer.on("traffic-request-logged", handler);
    return () => ipcRenderer.removeListener("traffic-request-logged", handler);
  },

  // Storage & System
  openExternal: (url: string) => ipcRenderer.invoke("open-external", url),
  storeGet: (key: string) => ipcRenderer.invoke("store-get", key),
  storeSet: (key: string, val: any) =>
    ipcRenderer.invoke("store-set", key, val),
  storeDelete: (key: string) => ipcRenderer.invoke("store-delete", key),
  setLoginItem: (openAtLogin: boolean) =>
    ipcRenderer.invoke("set-login-item", openAtLogin),

  // Updates
  checkForUpdates: () => ipcRenderer.send("check-for-updates"),
  installUpdate: () => ipcRenderer.send("install-update"),
  onUpdateChecking: (callback: () => void) => {
    ipcRenderer.on("update-checking", callback);
    return () => ipcRenderer.removeListener("update-checking", callback);
  },
  onUpdateMessage: (callback: (message: string) => void) => {
    const handler = (_event: any, message: string) => callback(message);
    ipcRenderer.on("update-message", handler);
    return () => ipcRenderer.removeListener("update-message", handler);
  },
  onUpdateAvailable: (callback: (info: any) => void) => {
    const handler = (_event: any, info: any) => callback(info);
    ipcRenderer.on("update-available", handler);
    return () => ipcRenderer.removeListener("update-available", handler);
  },
  onUpdateNotAvailable: (callback: () => void) => {
    ipcRenderer.on("update-not-available", callback);
    return () => ipcRenderer.removeListener("update-not-available", callback);
  },
  onUpdateDownloadProgress: (callback: (progress: any) => void) => {
    const handler = (_event: any, progress: any) => callback(progress);
    ipcRenderer.on("update-download-progress", handler);
    return () =>
      ipcRenderer.removeListener("update-download-progress", handler);
  },
  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on("update-downloaded", callback);
    return () => ipcRenderer.removeListener("update-downloaded", callback);
  },
  onUpdateError: (callback: (err: string) => void) => {
    const handler = (_event: any, err: string) => callback(err);
    ipcRenderer.on("update-error", handler);
    return () => ipcRenderer.removeListener("update-error", handler);
  },
};

contextBridge.exposeInMainWorld("api", api);

export type AppApi = typeof api;
