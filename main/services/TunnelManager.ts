import { ipcMain, Notification, WebContents } from "electron";
import { CloudflaredService } from "./CloudflaredService";

export class TunnelManager {
  private services: Map<string, CloudflaredService> = new Map();
  private lastTunnels: Map<string, { domain: string | null; port: number }> = new Map();
  private autoReconnect: boolean = true;
  private eventSender: WebContents | null = null;

  constructor() {
    // No single service creation in constructor anymore.
  }

  private getOrCreateService(tunnelId: string): CloudflaredService {
    let service = this.services.get(tunnelId);
    if (!service) {
      service = new CloudflaredService();
      this.services.set(tunnelId, service);
      this.setupInternalListeners(tunnelId, service);
    }
    return service;
  }

  private setupInternalListeners(tunnelId: string, service: CloudflaredService) {
    // Global notifications
    service.on("url", (url) => {
      new Notification({
        title: "Tunnel Active",
        body: `Your project is now live at ${url}`,
        silent: false,
      }).show();
      
      if (this.eventSender) {
        this.eventSender.send("tunnel-url", tunnelId, url);
      }
    });

    service.on("error", (error) => {
      new Notification({
        title: "Tunnel Error",
        body: `Failed to establish connection: ${error}`,
      }).show();

      if (this.eventSender) {
        this.eventSender.send("tunnel-error", tunnelId, error);
      }
    });

    service.on("log", (log) => {
      if (this.eventSender) {
        this.eventSender.send("tunnel-log", tunnelId, log);
      }
    });

    service.on("close", (code) => {
      if (code !== 0 && code !== null && this.autoReconnect) {
        console.log(`Tunnel ${tunnelId} closed unexpectedly. Attempting to reconnect...`);
        this.attemptReconnect(tunnelId);
      }
    });
  }

  private attemptReconnect(tunnelId: string) {
    setTimeout(async () => {
      const last = this.lastTunnels.get(tunnelId);
      const service = this.services.get(tunnelId);
      if (!last || !service) return;

      if (last.domain) {
        await service.startCustomTunnel(last.domain, last.port);
      } else {
        await service.startQuickTunnel(last.port);
      }
    }, 5000);
  }

  public registerIpcHandlers() {
    ipcMain.handle("check-auth", async () => {
      const tempService = new CloudflaredService();
      return await tempService.isAuthenticated();
    });

    ipcMain.handle("check-installation", async () => {
      const tempService = new CloudflaredService();
      return await tempService.checkInstallation();
    });

    ipcMain.handle("cloudflared-login", async (event) => {
      this.eventSender = event.sender;
      const tempService = new CloudflaredService();
      try {
        await tempService.login();
        return true;
      } catch (error) {
        return false;
      }
    });

    ipcMain.handle("start-quick-tunnel", async (event, tunnelId: string, port: number) => {
      this.eventSender = event.sender;
      this.lastTunnels.set(tunnelId, { domain: null, port });
      const service = this.getOrCreateService(tunnelId);
      await service.startQuickTunnel(port);
      return true;
    });

    ipcMain.handle(
      "start-custom-tunnel",
      async (event, tunnelId: string, params: { domain: string; port: number }) => {
        this.eventSender = event.sender;
        this.lastTunnels.set(tunnelId, { domain: params.domain, port: params.port });
        const service = this.getOrCreateService(tunnelId);
        await service.startCustomTunnel(params.domain, params.port);
        return true;
      },
    );

    ipcMain.handle("stop-tunnel", (event, tunnelId: string) => {
      this.eventSender = event.sender;
      this.lastTunnels.delete(tunnelId);
      const service = this.services.get(tunnelId);
      if (service) {
        service.stopTunnel();
        this.services.delete(tunnelId);
      }
      return true;
    });
  }

  public cleanup() {
    this.services.forEach((service) => {
      service.stopTunnel();
    });
    this.services.clear();
    this.lastTunnels.clear();
  }
}
