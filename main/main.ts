import path from "path";
import { app, ipcMain, BrowserWindow } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers/create-window";

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

let mainWindow: BrowserWindow;

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", async () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  (async () => {
    await app.whenReady();

    mainWindow = createWindow("main", {
      width: 1000,
      height: 600,
      webPreferences: {
        preload: path.join(import.meta.dirname, "preload.js"),
      },
    });

    if (isProd) {
      await mainWindow.loadURL("app://./home");
    } else {
      const port = process.argv[2];
      await mainWindow.loadURL(`http://localhost:${port}/home`);
      mainWindow.webContents.openDevTools();
    }
  })();
}

app.on("window-all-closed", () => {
  app.quit();
});

ipcMain.on("message", async (event, arg) => {
  event.reply("message", `${arg} World!`);
});
