import updater from "electron-updater";
const { autoUpdater } = updater;
import { BrowserWindow, ipcMain } from "electron";
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
    });

    autoUpdater.on("update-available", (info) => {
      this.sendStatusToWindow("Update available.");
      // Optional: notify renderer to show a "Downloading..." UI
      this.mainWindow.webContents.send("update-available", info);
    });

    autoUpdater.on("update-not-available", (info) => {
      this.sendStatusToWindow("Update not available.");
      this.mainWindow.webContents.send("update-not-available");
    });

    autoUpdater.on("error", (err) => {
      this.sendStatusToWindow("Error in auto-updater. " + err);
      this.mainWindow.webContents.send("update-error", err.toString());
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
      this.mainWindow.webContents.send("update-download-progress", progressObj);
    });

    autoUpdater.on("update-downloaded", (info) => {
      this.sendStatusToWindow("Update downloaded");
      // Notify renderer that update is ready to install
      this.mainWindow.webContents.send("update-downloaded");
    });

    // Handle IPC from renderer
    ipcMain.on("check-for-updates", () => {
      autoUpdater.checkForUpdatesAndNotify();
    });

    ipcMain.on("install-update", () => {
      autoUpdater.quitAndInstall();
    });
  }

  public check() {
    // Only check for updates in production
    if (process.env.NODE_ENV === "production") {
      autoUpdater.checkForUpdatesAndNotify();
    }
  }

  private sendStatusToWindow(text: string) {
    log.info(text);
    this.mainWindow.webContents.send("update-message", text);
  }
}
