import { ipcMain, Notification, BrowserWindow } from "electron";
import { CloudflaredService } from "./CloudflaredService";
import { ProxyManager } from "./ProxyManager";
import net from "net";

export class TunnelManager {
  private services: Map<string, CloudflaredService> = new Map();
  private lastTunnels: Map<string, { domain: string | null; port: number }> =
    new Map();
  private activeMetrics: Map<
    string,
    { port: number; lastRx: number; lastTx: number }
  > = new Map();
  private proxyManager: ProxyManager = new ProxyManager();
  private pollInterval: NodeJS.Timeout | null = null;
  private autoReconnect: boolean = true;
  public onStateChange?: () => void;

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

  private getFreePort(): Promise<number> {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(0, "127.0.0.1", () => {
        const address = server.address();
        const port = typeof address === "string" ? 0 : address?.port || 0;
        server.close(() => resolve(port));
      });
    });
  }

  private broadcast(channel: string, ...args: any[]) {
    BrowserWindow.getAllWindows().forEach((win) => {
      if (!win.isDestroyed() && !win.webContents.isDestroyed()) {
        win.webContents.send(channel, ...args);
      }
    });
  }

  private setupInternalListeners(
    tunnelId: string,
    service: CloudflaredService,
  ) {
    // Global notifications
    service.on("url", (url) => {
      const last = this.lastTunnels.get(tunnelId);
      if (last) {
        last.domain = url;
      }
      new Notification({
        title: "Tunnel Active",
        body: `Your project is now live at ${url}`,
        silent: false,
      }).show();

      this.broadcast("tunnel-url", tunnelId, url);
      this.onStateChange?.();
    });

    service.on("error", (error) => {
      new Notification({
        title: "Tunnel Error",
        body: `Failed to establish connection: ${error}`,
      }).show();

      this.broadcast("tunnel-error", tunnelId, error);
      this.onStateChange?.();
    });

    service.on("log", (log) => {
      this.broadcast("tunnel-log", tunnelId, log);
    });

    service.on("close", (code) => {
      if (code !== 0 && code !== null && this.autoReconnect) {
        console.log(
          `Tunnel ${tunnelId} closed unexpectedly. Attempting to reconnect...`,
        );
        this.attemptReconnect(tunnelId);
      }
      this.onStateChange?.();
    });
  }

  private attemptReconnect(tunnelId: string) {
    setTimeout(async () => {
      const last = this.lastTunnels.get(tunnelId);
      const service = this.services.get(tunnelId);
      if (!last || !service) return;

      let metricsPort = this.activeMetrics.get(tunnelId)?.port;
      if (!metricsPort) {
        metricsPort = await this.getFreePort();
        this.activeMetrics.set(tunnelId, {
          port: metricsPort,
          lastRx: 0,
          lastTx: 0,
        });
        this.startPolling();
      }

      const localPort = this.proxyManager.getProxyPort(tunnelId) || last.port;

      if (last.domain) {
        await service.startCustomTunnel(last.domain, localPort, metricsPort);
      } else {
        await service.startQuickTunnel(localPort, metricsPort);
      }
    }, 5000);
  }

  private startPolling() {
    if (this.pollInterval) return;
    this.pollInterval = setInterval(async () => {
      let totalDownload = 0;
      let totalUpload = 0;

      const metricsList = Array.from(this.activeMetrics.values());
      for (const data of metricsList) {
        try {
          const res = await fetch(`http://127.0.0.1:${data.port}/metrics`);
          if (!res.ok) continue;
          const text = await res.text();

          const rxMatch = text.match(
            /quic_client_receive_bytes\{conn_index="0"\} ([\d.e+]+)/,
          );
          const txMatch = text.match(
            /quic_client_sent_bytes\{conn_index="0"\} ([\d.e+]+)/,
          );

          const rxBytes = rxMatch ? parseFloat(rxMatch[1]) : 0;
          const txBytes = txMatch ? parseFloat(txMatch[1]) : 0;

          if (data.lastRx > 0 && rxBytes >= data.lastRx) {
            totalDownload += (rxBytes - data.lastRx) / 1024;
          }
          if (data.lastTx > 0 && txBytes >= data.lastTx) {
            totalUpload += (txBytes - data.lastTx) / 1024;
          }

          data.lastRx = rxBytes;
          data.lastTx = txBytes;
        } catch (err) {
          // ignore network fetch failures before metrics server starts
        }
      }

      this.broadcast("traffic-data", totalDownload, totalUpload);
    }, 1000);
  }

  private stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
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

    ipcMain.handle("cloudflared-login", async () => {
      const tempService = new CloudflaredService();
      try {
        await tempService.login();
        return true;
      } catch (error) {
        return false;
      }
    });

    ipcMain.handle(
      "start-quick-tunnel",
      async (_event, tunnelId: string, port: number) => {
        this.lastTunnels.set(tunnelId, { domain: null, port });

        const proxyPort = await this.proxyManager.startProxy(tunnelId, port);

        const metricsPort = await this.getFreePort();
        this.activeMetrics.set(tunnelId, {
          port: metricsPort,
          lastRx: 0,
          lastTx: 0,
        });
        this.startPolling();

        const service = this.getOrCreateService(tunnelId);
        await service.startQuickTunnel(proxyPort, metricsPort);
        this.onStateChange?.();
        return true;
      },
    );

    ipcMain.handle(
      "start-custom-tunnel",
      async (
        _event,
        tunnelId: string,
        params: { domain: string; port: number },
      ) => {
        this.lastTunnels.set(tunnelId, {
          domain: params.domain,
          port: params.port,
        });

        const proxyPort = await this.proxyManager.startProxy(
          tunnelId,
          params.port,
        );

        const metricsPort = await this.getFreePort();
        this.activeMetrics.set(tunnelId, {
          port: metricsPort,
          lastRx: 0,
          lastTx: 0,
        });
        this.startPolling();

        const service = this.getOrCreateService(tunnelId);
        await service.startCustomTunnel(params.domain, proxyPort, metricsPort);
        this.onStateChange?.();
        return true;
      },
    );

    ipcMain.handle("stop-tunnel", (_event, tunnelId: string) => {
      this.stopTunnel(tunnelId);
      return true;
    });

    ipcMain.handle("get-active-tunnels", () => {
      return Array.from(this.services.keys());
    });

    ipcMain.handle("stop-all-tunnels", () => {
      this.cleanup();
      return true;
    });
  }

  public getActiveTunnelsInfo(): Array<{
    id: string;
    url: string | null;
    port: number;
  }> {
    const list: Array<{ id: string; url: string | null; port: number }> = [];
    this.services.forEach((service, id) => {
      const info = this.lastTunnels.get(id);
      if (info) {
        list.push({ id, url: info.domain, port: info.port });
      }
    });
    return list;
  }

  /**
   * Stops a single tunnel and broadcasts the stop event to all renderer windows.
   * Used by TrayManager for individual tunnel control from the tray menu.
   */
  public stopTunnel(tunnelId: string) {
    this.proxyManager.stopProxy(tunnelId);
    this.lastTunnels.delete(tunnelId);
    this.activeMetrics.delete(tunnelId);
    if (this.activeMetrics.size === 0) {
      this.stopPolling();
    }
    const service = this.services.get(tunnelId);
    if (service) {
      service.stopTunnel();
      this.services.delete(tunnelId);
    }
    // Notify renderer so it can update its store
    this.broadcast("tunnel-stopped-from-main", tunnelId);
    this.onStateChange?.();
  }

  /**
   * Stops all active tunnels individually, broadcasting each stop to the renderer.
   * Used by TrayManager "Stop All" action.
   */
  public stopAllTunnels() {
    const tunnelIds = Array.from(this.services.keys());
    tunnelIds.forEach((id) => this.stopTunnel(id));
  }

  public cleanup() {
    this.stopPolling();
    this.proxyManager.cleanup();
    this.activeMetrics.clear();
    this.services.forEach((service) => {
      service.stopTunnel();
    });
    this.services.clear();
    this.lastTunnels.clear();
  }
}
