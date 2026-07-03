import { BrowserWindow } from "electron";
import http from "http";
import net from "net";

export interface TrafficRequestLog {
  id: string;
  tunnelId: string;
  timestamp: number;
  method: string;
  path: string;
  reqHeaders: http.IncomingHttpHeaders;
  reqBody: string;
  statusCode?: number;
  resHeaders?: http.OutgoingHttpHeaders;
  resBody?: string;
  latency?: number;
}

export class ProxyManager {
  private servers: Map<string, http.Server> = new Map();

  constructor() {}

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

  public async startProxy(
    tunnelId: string,
    targetPort: number,
  ): Promise<number> {
    const proxyPort = await this.getFreePort();

    const server = http.createServer((req, res) => {
      const startTime = Date.now();
      const reqId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

      const reqChunks: Buffer[] = [];
      req.on("data", (chunk) => {
        reqChunks.push(chunk);
      });

      req.on("end", () => {
        const reqBuffer = Buffer.concat(reqChunks);
        const reqContentType = (
          req.headers["content-type"] || ""
        ).toLowerCase();
        const isReqText =
          reqContentType.includes("json") ||
          reqContentType.includes("text") ||
          reqContentType.includes("xml") ||
          reqContentType.includes("form") ||
          reqContentType.includes("javascript");
        const reqBody = isReqText
          ? reqBuffer.toString("utf8")
          : `[Binary Data: ${reqBuffer.length} bytes]`;

        const proxyReq = http.request(
          {
            host: "127.0.0.1",
            port: targetPort,
            path: req.url,
            method: req.method,
            headers: req.headers,
          },
          (proxyRes) => {
            const resChunks: Buffer[] = [];

            res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);

            proxyRes.on("data", (chunk) => {
              resChunks.push(chunk);
              res.write(chunk);
            });

            proxyRes.on("end", () => {
              res.end();
              const latency = Date.now() - startTime;
              const resBuffer = Buffer.concat(resChunks);
              const resContentType = (
                proxyRes.headers["content-type"] || ""
              ).toLowerCase();
              const isResText =
                resContentType.includes("json") ||
                resContentType.includes("text") ||
                resContentType.includes("xml") ||
                resContentType.includes("form") ||
                resContentType.includes("javascript");
              const resBody = isResText
                ? resBuffer.toString("utf8")
                : `[Binary Data: ${resBuffer.length} bytes]`;

              this.sendTrafficLog({
                id: reqId,
                tunnelId,
                timestamp: startTime,
                method: req.method || "GET",
                path: req.url || "/",
                reqHeaders: req.headers,
                reqBody,
                statusCode: proxyRes.statusCode,
                resHeaders: proxyRes.headers,
                resBody:
                  resBody.length > 5000
                    ? resBody.substring(0, 5000) + "... (truncated)"
                    : resBody,
                latency,
              });
            });
          },
        );

        proxyReq.on("error", (err) => {
          res.writeHead(502, { "Content-Type": "text/plain" });
          res.end(
            `Bad Gateway: Failed to forward request to local port ${targetPort}. Error: ${err.message}`,
          );

          const latency = Date.now() - startTime;
          this.sendTrafficLog({
            id: reqId,
            tunnelId,
            timestamp: startTime,
            method: req.method || "GET",
            path: req.url || "/",
            reqHeaders: req.headers,
            reqBody,
            statusCode: 502,
            resBody: `Error forwarding to port ${targetPort}: ${err.message}`,
            latency,
          });
        });

        proxyReq.write(reqBuffer);
        proxyReq.end();
      });
    });

    server.listen(proxyPort, "127.0.0.1");
    this.servers.set(tunnelId, server);
    console.log(
      `Proxy server started for tunnel ${tunnelId} on port ${proxyPort} -> target ${targetPort}`,
    );
    return proxyPort;
  }

  public stopProxy(tunnelId: string) {
    const server = this.servers.get(tunnelId);
    if (server) {
      server.close();
      this.servers.delete(tunnelId);
      console.log(`Proxy server stopped for tunnel ${tunnelId}`);
    }
  }

  public getProxyPort(tunnelId: string): number | undefined {
    const server = this.servers.get(tunnelId);
    if (!server) return undefined;
    const addr = server.address();
    return typeof addr === "string" ? undefined : addr?.port;
  }

  private sendTrafficLog(log: TrafficRequestLog) {
    BrowserWindow.getAllWindows().forEach((win) => {
      if (!win.isDestroyed() && !win.webContents.isDestroyed()) {
        win.webContents.send("traffic-request-logged", log);
      }
    });
  }

  public cleanup() {
    this.servers.forEach((server) => {
      server.close();
    });
    this.servers.clear();
  }
}
