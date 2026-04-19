import path from "path";
import { app, BrowserWindow } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers/create-window";
import { WindowManager } from "./services/WindowManager";
import { TunnelManager } from "./services/TunnelManager";
import { TrayManager } from "./services/TrayManager";
import Store from "electron-store";
import { ipcMain } from "electron";

const store = new Store();

const isProd = process.env.NODE_ENV === "production";

class ProxlyteApp {
  private mainWindow: BrowserWindow | null = null;
  private tunnelManager: TunnelManager | null = null;
  private trayManager: TrayManager | null = null;

  constructor() {
    this.setupEnvironment();
    this.setupLock();
  }

  private setupEnvironment() {
    if (isProd) {
      serve({ directory: "app" });
    } else {
      app.setPath("userData", `${app.getPath("userData")} (development)`);
    }
  }

  private setupLock() {
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      app.quit();
    } else {
      app.on("second-instance", this.focusMainWindow.bind(this));
    }
  }

  public async init() {
    await app.whenReady();
    await this.createMainWindow();
    this.setupGlobalHandlers();
  }

  private async createMainWindow() {
    this.mainWindow = createWindow("main", {
      width: 1000,
      height: 600,
      frame: false,
      show: false,
      transparent: true,
      webPreferences: {
        preload: path.join(import.meta.dirname, "preload.js"),
      },
    });

    // Sub-systems
    this.tunnelManager = new TunnelManager();
    this.tunnelManager.registerIpcHandlers();
    WindowManager.bindWindowEvents(this.mainWindow);
    this.trayManager = new TrayManager(this.mainWindow);

    // Load Content
    const shouldShow = !process.argv.includes("--hidden");
    
    if (isProd) {
      await this.mainWindow.loadURL("app://./home");
    } else {
      const port = process.argv[2];
      await this.mainWindow.loadURL(`http://localhost:${port}/home`);
      // this.mainWindow.webContents.openDevTools();
    }

    if (shouldShow) {
      this.mainWindow.show();
    } else {
      this.mainWindow.hide();
    }
  }

  private setupGlobalHandlers() {
    WindowManager.setupHandlers();

    ipcMain.handle("store-get", (event, key) => store.get(key));
    ipcMain.handle("store-set", (event, key, val) => store.set(key, val));
    ipcMain.handle("store-delete", (event, key) => store.delete(key));
    ipcMain.handle("set-login-item", (event, openAtLogin) => {
      app.setLoginItemSettings({ openAtLogin });
    });

    app.on("before-quit", () => {
      if (this.trayManager) this.trayManager.setQuitting(true);
    });

    app.on("window-all-closed", () => {
      this.cleanup();
      app.quit();
    });
  }

  private focusMainWindow() {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) this.mainWindow.restore();
      this.mainWindow.focus();
    }
  }

  private cleanup() {
    if (this.tunnelManager) {
      this.tunnelManager.cleanup();
    }
  }
}

// Instantiate and start
const proxlyteApp = new ProxlyteApp();
proxlyteApp.init().catch((err) => {
  console.error("Failed to start Proxlyte:", err);
  app.quit();
});
