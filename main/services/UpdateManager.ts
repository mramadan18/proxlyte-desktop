import updater from "electron-updater";
const { autoUpdater } = updater;
import { app, BrowserWindow, ipcMain } from "electron";
import log from "electron-log";

// Configure logging for updates
autoUpdater.logger = log;
// @ts-ignore
autoUpdater.logger.transports.file.level = "info";

export class UpdateManager {
  private mainWindow: BrowserWindow;

  constructor(window: BrowserWindow) {
    this.mainWindow = window;
    this.setupHandlers();
  }

  private setupHandlers() {
    autoUpdater.on("checking-for-update", () => {
      this.sendStatusToWindow("Checking for update...");
      this.sendToWindow("update-checking");
    });

    autoUpdater.on("update-available", (info) => {
      this.sendStatusToWindow("Update available.");
      this.sendToWindow("update-available", info);
    });

    autoUpdater.on("update-not-available", (info) => {
      this.sendStatusToWindow("Update not available.");
      this.sendToWindow("update-not-available");
    });

    autoUpdater.on("error", (err) => {
      this.sendStatusToWindow("Error in auto-updater. " + err);
      this.sendToWindow("update-error", err.toString());
    });

    autoUpdater.on("download-progress", (progressObj) => {
      let log_message = "Download speed: " + progressObj.bytesPerSecond;
      log_message = log_message + " - Downloaded " + progressObj.percent + "%";
      log_message =
        log_message +
        " (" +
        progressObj.transferred +
        "/" +
        progressObj.total +
        ")";
      this.sendStatusToWindow(log_message);

      // Send detailed progress to renderer
      this.sendToWindow("update-download-progress", progressObj);
    });

    autoUpdater.on("update-downloaded", (info) => {
      this.sendStatusToWindow("Update downloaded");
      // Notify renderer that update is ready to install
      this.sendToWindow("update-downloaded");
    });

    // Handle IPC from renderer
    ipcMain.on("check-for-updates", () => {
      if (!app.isPackaged || process.env.NODE_ENV !== "production") {
        this.sendStatusToWindow("Update checks are disabled in development mode.");
        this.sendToWindow("update-not-available");
        return;
      }
      autoUpdater.checkForUpdatesAndNotify();
    });

    ipcMain.on("install-update", () => {
      // isSilent: false, isForceRunAfter: true (ensure app restarts after installer completes)
      autoUpdater.quitAndInstall(false, true);
    });
  }

  public check() {
    // Only check for updates in production when packaged
    if (app.isPackaged && process.env.NODE_ENV === "production") {
      autoUpdater.checkForUpdatesAndNotify();
    }
  }

  private sendToWindow(channel: string, ...args: any[]) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, ...args);
    }
  }

  private sendStatusToWindow(text: string) {
    log.info(text);
    this.sendToWindow("update-message", text);
  }
}

