import { app, Tray, Menu, nativeImage, BrowserWindow } from "electron";
import path from "path";

export class TrayManager {
  private tray: Tray | null = null;
  private mainWindow: BrowserWindow;
  private isQuitting: boolean = false;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.createTray();
    this.handleWindowClose();
  }

  private getIconPath() {
    return path.join(app.getAppPath(), "resources", "icon.ico");
  }

  private createTray() {
    const iconPath = this.getIconPath();
    const icon = nativeImage.createFromPath(iconPath);
    this.tray = new Tray(icon);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Show Proxlyte",
        click: () => {
          this.mainWindow.show();
        },
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => {
          this.isQuitting = true;
          app.quit();
        },
      },
    ]);

    this.tray.setToolTip("Proxlyte");
    this.tray.setContextMenu(contextMenu);

    this.tray.on("click", () => {
      this.mainWindow.show();
    });
  }

  private handleWindowClose() {
    this.mainWindow.on("close", (event) => {
      if (!this.isQuitting) {
        event.preventDefault();
        this.mainWindow.hide();
      }
    });
  }

  public setQuitting(quitting: boolean) {
    this.isQuitting = quitting;
  }
}
