import path from "path";
import { app, BrowserWindow } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers/create-window";
import { ProxyManager } from "./services/ProxyManager";
import { WindowManager } from "./services/WindowManager";

const isProd = process.env.NODE_ENV === "production";

class ProxlyteApp {
  private mainWindow: BrowserWindow | null = null;
  private proxyManager: ProxyManager | null = null;

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
      transparent: true,
      webPreferences: {
        preload: path.join(import.meta.dirname, "preload.js"),
      },
    });

    // Sub-systems
    this.proxyManager = new ProxyManager(this.mainWindow);
    WindowManager.bindWindowEvents(this.mainWindow);

    // Load Content
    if (isProd) {
      await this.mainWindow.loadURL("app://./home");
    } else {
      const port = process.argv[2];
      await this.mainWindow.loadURL(`http://localhost:${port}/home`);
      this.mainWindow.webContents.openDevTools();
    }
  }

  private setupGlobalHandlers() {
    WindowManager.setupHandlers();

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
    if (this.proxyManager) {
      this.proxyManager.cleanup();
    }
  }
}

// Instantiate and start
const proxlyteApp = new ProxlyteApp();
proxlyteApp.init().catch((err) => {
  console.error("Failed to start Proxlyte:", err);
  app.quit();
});
