import { ipcMain, Notification, WebContents } from "electron";
import { CloudflaredService } from "./CloudflaredService";

export class TunnelManager {
  private service: CloudflaredService;
  private autoReconnect: boolean = true;
  private lastPort: number | null = null;
  private lastDomain: string | null = null;
  private eventSender: WebContents | null = null;

  constructor() {
    this.service = new CloudflaredService();
    this.setupInternalListeners();
  }

  private setupInternalListeners() {
    // Global notifications
    this.service.on("url", (url) => {
      new Notification({
        title: "Tunnel Active",
        body: `Your project is now live at ${url}`,
        silent: false,
      }).show();
      
      if (this.eventSender) {
        this.eventSender.send("tunnel-url", url);
      }
    });

    this.service.on("error", (error) => {
      new Notification({
        title: "Tunnel Error",
        body: `Failed to establish connection: ${error}`,
      }).show();

      if (this.eventSender) {
        this.eventSender.send("tunnel-error", error);
      }
    });

    this.service.on("log", (log) => {
      if (this.eventSender) {
        this.eventSender.send("tunnel-log", log);
      }
    });

    this.service.on("close", (code) => {
      if (code !== 0 && code !== null && this.autoReconnect) {
        console.log("Tunnel closed unexpectedly. Attempting to reconnect...");
        this.attemptReconnect();
      }
    });
  }

  private attemptReconnect() {
    setTimeout(async () => {
      if (this.lastDomain) {
        await this.service.startCustomTunnel(this.lastDomain, this.lastPort || 80);
      } else if (this.lastPort) {
        await this.service.startQuickTunnel(this.lastPort);
      }
    }, 5000);
  }

  public registerIpcHandlers() {
    ipcMain.handle("check-auth", async () => {
      return await this.service.isAuthenticated();
    });

    ipcMain.handle("check-installation", async () => {
      return await this.service.checkInstallation();
    });

    ipcMain.handle("cloudflared-login", async (event) => {
      this.eventSender = event.sender;
      try {
        await this.service.login();
        return true;
      } catch (error) {
        return false;
      }
    });

    ipcMain.handle("start-quick-tunnel", async (event, port: number) => {
      this.eventSender = event.sender;
      this.lastPort = port;
      this.lastDomain = null;
      await this.service.startQuickTunnel(port);
      return true;
    });

    ipcMain.handle(
      "start-custom-tunnel",
      async (event, params: { domain: string; port: number }) => {
        this.eventSender = event.sender;
        this.lastPort = params.port;
        this.lastDomain = params.domain;
        await this.service.startCustomTunnel(params.domain, params.port);
        return true;
      },
    );

    ipcMain.handle("stop-tunnel", (event) => {
      this.eventSender = event.sender;
      this.lastPort = null;
      this.lastDomain = null;
      this.service.stopTunnel();
      return true;
    });
  }

  public cleanup() {
    this.service.stopTunnel();
  }
}
