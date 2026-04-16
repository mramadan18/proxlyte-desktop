import { ipcMain, BrowserWindow } from "electron";

export class ProxyManager {
  private isRunning: boolean = false;
  private mainWindow: BrowserWindow | null = null;

  constructor(window: BrowserWindow) {
    this.mainWindow = window;
    this.setupIpc();
  }

  private setupIpc() {
    ipcMain.handle("get-server-status", () => {
      return this.isRunning ? "running" : "stopped";
    });

    ipcMain.handle("start-server", async () => {
      console.log("Main Process: Starting proxy server...");
      this.isRunning = true;
      this.notifyStatusChange();
      return true;
    });

    ipcMain.handle("stop-server", async () => {
      console.log("Main Process: Stopping proxy server...");
      this.isRunning = false;
      this.notifyStatusChange();
      return true;
    });

    ipcMain.handle("get-latest-logs", () => {
      return [];
    });
  }

  private notifyStatusChange() {
    if (this.mainWindow) {
      this.mainWindow.webContents.send(
        "proxy-status-changed",
        this.isRunning ? "running" : "stopped",
      );
    }
  }

  public cleanup() {
    // Cleanup logic when shutting down
    this.isRunning = false;
  }
}
