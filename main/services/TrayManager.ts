import {
  app,
  Tray,
  nativeImage,
  BrowserWindow,
  screen,
  ipcMain,
  Menu,
  clipboard,
} from "electron";
import path from "path";
import type { TunnelManager } from "./TunnelManager";

export class TrayManager {
  private tray: Tray | null = null;
  private mainWindow: BrowserWindow;
  private tunnelManager?: TunnelManager;
  private trayWindow: BrowserWindow | null = null;
  private isQuitting: boolean = false;
  private hoverTimer: NodeJS.Timeout | null = null;
  private hoverTrackingInterval: NodeJS.Timeout | null = null;
  private lastOpenedTime: number = 0;
  private lastHiddenTime: number = 0;

  constructor(mainWindow: BrowserWindow, tunnelManager?: TunnelManager) {
    this.mainWindow = mainWindow;
    this.tunnelManager = tunnelManager;
    this.createTray();
    this.createTrayWindow();
    this.setupIpcHandlers();
    this.handleWindowClose();
  }

  private getIconPath() {
    return path.join(app.getAppPath(), "resources", "icon.ico");
  }

  private stopHoverTracking() {
    if (this.hoverTrackingInterval) {
      clearInterval(this.hoverTrackingInterval);
      this.hoverTrackingInterval = null;
    }
  }

  private startHoverTracking() {
    this.stopHoverTracking();
    // Delay the first check to let the window fully settle on screen
    setTimeout(() => {
      this.hoverTrackingInterval = setInterval(() => {
        if (!this.trayWindow || !this.tray || !this.trayWindow.isVisible()) {
          this.stopHoverTracking();
          return;
        }

        const cursor = screen.getCursorScreenPoint();
        const winBounds = this.trayWindow.getBounds();
        const trayBounds = this.tray.getBounds();

        const pad = 25;
        const inWindow =
          cursor.x >= winBounds.x - pad &&
          cursor.x <= winBounds.x + winBounds.width + pad &&
          cursor.y >= winBounds.y - pad &&
          cursor.y <= winBounds.y + winBounds.height + pad;

        const inTray =
          cursor.x >= trayBounds.x - pad &&
          cursor.x <= trayBounds.x + trayBounds.width + pad &&
          cursor.y >= trayBounds.y - pad &&
          cursor.y <= trayBounds.y + trayBounds.height + pad;

        if (!inWindow && !inTray) {
          this.stopHoverTracking();
          this.lastHiddenTime = Date.now();
          this.trayWindow.hide();
        }
      }, 300);
    }, 600);
  }

  private createTray() {
    const iconPath = this.getIconPath();
    const icon = nativeImage.createFromPath(iconPath);
    this.tray = new Tray(icon);
    this.tray.setToolTip("Proxlyte");

    this.tray.on("click", () => {
      if (this.hoverTimer) {
        clearTimeout(this.hoverTimer);
        this.hoverTimer = null;
      }
      this.stopHoverTracking();
      this.toggleTrayWindow(false);
    });

    this.tray.on("mouse-enter", () => {
      // Don't re-trigger if we just hid the window via hover tracking (cooldown 2s)
      if (Date.now() - this.lastHiddenTime < 2000) return;
      if (!this.trayWindow?.isVisible() && !this.hoverTimer) {
        this.hoverTimer = setTimeout(() => {
          this.hoverTimer = null;
          if (!this.trayWindow?.isVisible()) {
            this.showTrayWindow(true);
          }
        }, 1200);
      }
    });

    this.tray.on("mouse-leave", () => {
      if (this.hoverTimer) {
        clearTimeout(this.hoverTimer);
        this.hoverTimer = null;
      }
    });

    this.tray.on("right-click", () => {
      if (this.hoverTimer) {
        clearTimeout(this.hoverTimer);
        this.hoverTimer = null;
      }
      this.stopHoverTracking();
      if (this.trayWindow?.isVisible()) {
        this.trayWindow.hide();
      }

      const activeList = this.tunnelManager
        ? this.tunnelManager.getActiveTunnelsInfo()
        : [];
      const hasActive = activeList.length > 0;

      const template: Electron.MenuItemConstructorOptions[] = [
        {
          label: hasActive
            ? `Proxlyte (${activeList.length} Active Connection${activeList.length > 1 ? "s" : ""})`
            : "Proxlyte (System Idle)",
          enabled: false,
        },
        { type: "separator" },
      ];

      if (hasActive) {
        template.push({
          label: "Active Tunnels",
          submenu: activeList.map((t) => ({
            label: `Port ${t.port}${t.url ? `  •  ${t.url.replace("https://", "")}` : ""}`,
            click: () => {
              if (t.url) {
                clipboard.writeText(t.url);
              }
            },
          })),
        });
        template.push({
          label: "Stop All Active Tunnels",
          click: () => {
            if (this.tunnelManager) {
              this.tunnelManager.cleanup();
            }
            this.mainWindow.webContents.send("trigger-stop-all");
            this.trayWindow?.webContents.send("trigger-stop-all");
          },
        });
        template.push({ type: "separator" });
      }

      template.push({
        label: "Quick Port Launch",
        submenu: [
          {
            label: "Port 3000",
            click: () => {
              this.mainWindow.show();
              this.mainWindow.focus();
              this.mainWindow.webContents.send("trigger-quick-tunnel", "3000");
            },
          },
          {
            label: "Port 5173",
            click: () => {
              this.mainWindow.show();
              this.mainWindow.focus();
              this.mainWindow.webContents.send("trigger-quick-tunnel", "5173");
            },
          },
          {
            label: "Port 8000",
            click: () => {
              this.mainWindow.show();
              this.mainWindow.focus();
              this.mainWindow.webContents.send("trigger-quick-tunnel", "8000");
            },
          },
          {
            label: "Port 8080",
            click: () => {
              this.mainWindow.show();
              this.mainWindow.focus();
              this.mainWindow.webContents.send("trigger-quick-tunnel", "8080");
            },
          },
        ],
      });

      template.push({ type: "separator" });

      template.push({
        label: "Open Dashboard Window",
        click: () => {
          this.mainWindow.show();
          this.mainWindow.focus();
        },
      });

      template.push({
        label: "Quit Proxlyte",
        click: () => {
          this.isQuitting = true;
          app.quit();
        },
      });

      const contextMenu = Menu.buildFromTemplate(template);
      this.tray?.popUpContextMenu(contextMenu);
    });
  }

  private createTrayWindow() {
    this.trayWindow = new BrowserWindow({
      width: 480,
      height: 320,
      show: false,
      frame: false,
      fullscreenable: false,
      resizable: false,
      transparent: true,
      skipTaskbar: true,
      alwaysOnTop: true,
      webPreferences: {
        preload: path.join(import.meta.dirname, "preload.js"),
      },
    });

    const isProd = process.env.NODE_ENV === "production";
    if (isProd) {
      this.trayWindow.loadURL("app://./tray");
    } else {
      const port = process.argv[2] || "1000";
      this.trayWindow.loadURL(`http://localhost:${port}/tray`);
    }

    this.trayWindow.on("blur", () => {
      if (Date.now() - this.lastOpenedTime < 800) return;
      if (this.hoverTrackingInterval) return;
      if (!this.trayWindow?.webContents.isDevToolsOpened()) {
        this.stopHoverTracking();
        this.trayWindow?.hide();
      }
    });

    this.trayWindow.on("close", (event) => {
      if (!this.isQuitting) {
        event.preventDefault();
        this.stopHoverTracking();
        this.trayWindow?.hide();
      }
    });
  }

  public toggleTrayWindow(openedByHover: boolean = false) {
    if (!this.trayWindow || !this.tray) return;
    if (this.trayWindow.isVisible()) {
      this.stopHoverTracking();
      this.trayWindow.hide();
    } else {
      this.showTrayWindow(openedByHover);
    }
  }

  private showTrayWindow(openedByHover: boolean = false) {
    if (!this.trayWindow || !this.tray) return;
    this.lastOpenedTime = Date.now();
    const trayBounds = this.tray.getBounds();
    const windowBounds = this.trayWindow.getBounds();
    const display = screen.getDisplayNearestPoint({
      x: trayBounds.x,
      y: trayBounds.y,
    });

    let x = Math.round(
      trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2,
    );
    let y = Math.round(trayBounds.y - windowBounds.height - 10);

    if (x < display.workArea.x) {
      x = display.workArea.x + 10;
    } else if (
      x + windowBounds.width >
      display.workArea.x + display.workArea.width
    ) {
      x = display.workArea.x + display.workArea.width - windowBounds.width - 10;
    }

    if (y < display.bounds.y) {
      y = Math.round(trayBounds.y + trayBounds.height + 10);
    }

    this.trayWindow.setPosition(x, y, false);
    this.trayWindow.setAlwaysOnTop(true, "screen-saver");
    this.trayWindow.moveTop();

    const trayCenterX = Math.round(trayBounds.x + trayBounds.width / 2);
    const arrowX = Math.round(trayCenterX - x);
    this.trayWindow.webContents.send("tray-arrow-pos", arrowX);

    if (openedByHover) {
      this.trayWindow.showInactive();
      this.startHoverTracking();
    } else {
      this.trayWindow.show();
      this.trayWindow.focus();
      this.stopHoverTracking();
    }
  }

  private setupIpcHandlers() {
    ipcMain.on("tray-show-main", () => {
      this.stopHoverTracking();
      this.trayWindow?.hide();
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      this.mainWindow.show();
      this.mainWindow.focus();
    });

    ipcMain.on("tray-hide", () => {
      this.stopHoverTracking();
      this.trayWindow?.hide();
    });

    ipcMain.on("tray-quit", () => {
      this.isQuitting = true;
      app.quit();
    });

    ipcMain.on("update-tray-tooltip", (event, text: string) => {
      if (this.tray) {
        this.tray.setToolTip(text || "Proxlyte");
      }
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
