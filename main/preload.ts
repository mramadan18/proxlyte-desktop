import { contextBridge, ipcRenderer } from "electron";

const api = {
  // Window controls
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),
  isMaximized: () => ipcRenderer.invoke("is-window-maximized"),

  // Proxy controls
  startServer: () => ipcRenderer.invoke("start-server"),
  stopServer: () => ipcRenderer.invoke("stop-server"),
  getServerStatus: () => ipcRenderer.invoke("get-server-status"),

  // Events
  onMaximized: (callback: () => void) => {
    ipcRenderer.on("window-maximized", callback);
    return () => ipcRenderer.removeListener("window-maximized", callback);
  },
  onUnmaximized: (callback: () => void) => {
    ipcRenderer.on("window-unmaximized", callback);
    return () => ipcRenderer.removeListener("window-unmaximized", callback);
  },
};

contextBridge.exposeInMainWorld("api", api);

export type AppApi = typeof api;
