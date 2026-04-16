import { ipcMain, BrowserWindow } from 'electron';

export class WindowManager {
  public static setupHandlers() {
    ipcMain.on("window-minimize", (event) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win) win.minimize();
    });

    ipcMain.on("window-maximize", (event) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win) {
        if (win.isMaximized()) {
          win.restore();
        } else {
          win.maximize();
        }
      }
    });

    ipcMain.on("window-close", (event) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win) win.close();
    });

    ipcMain.handle("is-window-maximized", (event) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      return win ? win.isMaximized() : false;
    });
  }

  public static bindWindowEvents(window: BrowserWindow) {
    window.on("maximize", () => {
      window.webContents.send("window-maximized");
    });

    window.on("unmaximize", () => {
      window.webContents.send("window-unmaximized");
    });
  }
}
