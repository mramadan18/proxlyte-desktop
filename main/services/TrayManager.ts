import {
  Tray,
  Menu,
  nativeImage,
  app,
  BrowserWindow,
  clipboard,
} from "electron";
import path from "path";
import Store from "electron-store";
import { TunnelManager } from "./TunnelManager";

const isProd = process.env.NODE_ENV === "production";

export class TrayManager {
  private tray: Tray | null = null;
  private mainWindow: BrowserWindow;
  private tunnelManager: TunnelManager;
  private store: Store;
  private isQuitting = false;

  constructor(
    mainWindow: BrowserWindow,
    tunnelManager: TunnelManager,
    store: Store,
  ) {
    this.mainWindow = mainWindow;
    this.tunnelManager = tunnelManager;
    this.store = store;

    this.createTray();
    this.setupWindowBehavior();

    // Set the quitting flag on before-quit so close-to-tray logic can differentiate
    // between a real quit and a user clicking the X button
    app.on("before-quit", () => {
      this.isQuitting = true;
    });
  }

  /**
   * Resolves the path to the app icon.
   * In production, icons are in process.resourcesPath.
   * In dev, they're in the project's resources/ folder.
   */
  private getIconPath(): string {
    return isProd
      ? path.join(process.resourcesPath, "icon.ico")
      : path.join(process.cwd(), "resources", "icon.ico");
  }

  /**
   * Reads a setting from the persisted Zustand store.
   * Zustand's persist middleware stores state as a JSON string under "proxlyte-settings".
   */
  private getSetting(key: string, defaultValue: any): any {
    try {
      const raw = this.store.get("proxlyte-settings") as string;
      if (!raw) return defaultValue;
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return parsed?.state?.settings?.[key] ?? defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private createTray() {
    const icon = nativeImage.createFromPath(this.getIconPath());
    this.tray = new Tray(icon.resize({ width: 16, height: 16 }));
    this.tray.setToolTip("Proxlyte — No active tunnels");

    this.tray.on("click", () => {
      this.showWindow();
    });

    this.rebuildMenu();
  }

  /**
   * Intercepts the window close and minimize events to optionally
   * hide to tray instead of actually closing/minimizing.
   */
  private setupWindowBehavior() {
    // Close to tray: prevent real close and hide instead
    this.mainWindow.on("close", (event) => {
      if (!this.isQuitting && this.getSetting("closeToTray", true)) {
        event.preventDefault();
        this.mainWindow.hide();
      }
    });

    // Minimize to tray: hide when minimized
    this.mainWindow.on("minimize", () => {
      if (this.getSetting("minimizeToTray", true)) {
        this.mainWindow.hide();
      }
    });
  }

  private showWindow() {
    if (this.mainWindow) {
      if (!this.mainWindow.isVisible()) {
        this.mainWindow.show();
      }
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      this.mainWindow.focus();
    }
  }

  /**
   * Rebuilds the tray context menu dynamically based on current tunnel state.
   * Called whenever tunnels start, stop, connect, or error.
   */
  public rebuildMenu() {
    if (!this.tray) return;

    const tunnels = this.tunnelManager.getActiveTunnelsInfo();
    const activeTunnelCount = tunnels.length;

    // ── Update Tooltip ──────────────────────────────────────────────
    if (activeTunnelCount === 0) {
      this.tray.setToolTip("Proxlyte — No active tunnels");
    } else {
      const ports = tunnels.map((t) => t.port).join(", ");
      this.tray.setToolTip(
        `Proxlyte — ${activeTunnelCount} tunnel${activeTunnelCount > 1 ? "s" : ""} active (${ports})`,
      );
    }

    // ── Build Tunnel Submenu Items ──────────────────────────────────
    const tunnelMenuItems: Electron.MenuItemConstructorOptions[] = tunnels.map(
      (t) => ({
        label: `▶ port ${t.port} → ${t.url || "Starting..."}`,
        submenu: [
          {
            label: "Copy URL",
            enabled: !!t.url,
            click: () => {
              if (t.url) clipboard.writeText(t.url);
            },
          },
          {
            label: "Stop Tunnel",
            click: () => {
              this.tunnelManager.stopTunnel(t.id);
              this.rebuildMenu();
            },
          },
        ],
      }),
    );

    // ── Assemble Full Menu ──────────────────────────────────────────
    const template: Electron.MenuItemConstructorOptions[] = [
      { label: "Proxlyte", enabled: false },
      { type: "separator" },
    ];

    // Tunnel status section
    if (activeTunnelCount > 0) {
      template.push(
        {
          label: `Active Tunnels: ${activeTunnelCount}`,
          enabled: false,
        },
        { type: "separator" },
        ...tunnelMenuItems,
        { type: "separator" },
        {
          label: "⛔ Stop All Tunnels",
          click: () => {
            this.tunnelManager.stopAllTunnels();
            this.rebuildMenu();
          },
        },
        { type: "separator" },
      );
    } else {
      template.push(
        { label: "No active tunnels", enabled: false },
        { type: "separator" },
      );
    }

    // Window & system actions
    template.push(
      {
        label: "📂 Show Window",
        click: () => this.showWindow(),
      },
      { type: "separator" },
      {
        label: "❌ Quit Proxlyte",
        click: () => {
          this.isQuitting = true;
          app.quit();
        },
      },
    );

    const contextMenu = Menu.buildFromTemplate(template);
    this.tray.setContextMenu(contextMenu);
  }

  public destroy() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}
