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

/**
 * Max response body to capture per request (larger bodies are truncated).
 */
const MAX_BODY_CAPTURE = 5000;

/**
 * Max response body to send over IPC per request (even harsher limit for IPC safety).
 */
const MAX_IPC_BODY = 2000;

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
      const reqId = `req_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 5)}`;

      // --- Collect request body for logging (up to limit) ---
      let reqBodyCaptured = false;
      let reqBodyText = "";
      let reqBodySize = 0;
      const reqContentType = (
        req.headers["content-type"] || ""
      ).toLowerCase();
      const isReqText =
        reqContentType.includes("json") ||
        reqContentType.includes("text") ||
        reqContentType.includes("xml") ||
        reqContentType.includes("form") ||
        reqContentType.includes("javascript");

      // Only capture small request bodies (< 50KB)
      const reqCl = parseInt(req.headers["content-length"] || "0", 10);
      const captureReqBody = isReqText && reqCl > 0 && reqCl < 50_000;

      if (captureReqBody) {
        const reqChunks: Buffer[] = [];
        req.on("data", (chunk: Buffer) => {
          if (reqChunks.length < 200) {
            // limit ~100KB
            reqChunks.push(chunk);
          }
        });
        req.on("end", () => {
          const reqBuffer = Buffer.concat(reqChunks);
          reqBodySize = reqBuffer.length;
          reqBodyText = isReqText
            ? reqBuffer.toString("utf8", 0, 2000) // cap for IPC
            : `[Binary Data: ${reqBuffer.length} bytes]`;
          if (reqBodyText.length > MAX_IPC_BODY) {
            reqBodyText = reqBodyText.substring(0, MAX_IPC_BODY) + "... (truncated)";
          }
          reqBodyCaptured = true;
        });
      }

      // --- Proxy request to target ---
      const proxyReq = http.request(
        {
          host: "127.0.0.1",
          port: targetPort,
          path: req.url,
          method: req.method,
          headers: req.headers,
        },
        (proxyRes) => {
          // Send status to client immediately
          res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);

          // --- Stream response to client (NO buffering) ---
          let resBodyText = "";
          let resBodySize = 0;
          let resBodyTruncated = false;
          const resContentType = (
            proxyRes.headers["content-type"] || ""
          ).toLowerCase();
          const isResText =
            resContentType.includes("json") ||
            resContentType.includes("text") ||
            resContentType.includes("xml") ||
            resContentType.includes("form") ||
            resContentType.includes("javascript");

          // Only capture if small enough (< 100KB) and text-like
          const resCl = parseInt(proxyRes.headers["content-length"] || "0", 10);
          const captureResBody = isResText && resCl > 0 && resCl < 100_000;

          proxyRes.on("data", (chunk: Buffer) => {
            // Write to client immediately (stream)
            res.write(chunk);

            // Optionally capture small body sample for inspector
            if (captureResBody && !resBodyTruncated) {
              if (resBodySize + chunk.length <= MAX_BODY_CAPTURE) {
                resBodyText += chunk.toString("utf8");
                resBodySize += chunk.length;
              } else {
                resBodyText += chunk.toString("utf8", 0, MAX_BODY_CAPTURE - resBodySize);
                resBodyText += "... (truncated)";
                resBodyTruncated = true;
              }
            }
          });

          proxyRes.on("end", () => {
            res.end();
            const latency = Date.now() - startTime;

            // Wait briefly for req body capture if needed, then send log
            const sendLog = () => {
              const log: TrafficRequestLog = {
                id: reqId,
                tunnelId,
                timestamp: startTime,
                method: req.method || "GET",
                path: req.url || "/",
                reqHeaders: req.headers,
                reqBody:
                  reqBodyCaptured
                    ? reqBodyText
                    : captureReqBody
                      ? "..."
                      : `[Binary Data${reqBodySize ? `: ${reqBodySize} bytes` : ""}]`,
                statusCode: proxyRes.statusCode,
                resHeaders: proxyRes.headers,
                resBody: captureResBody
                  ? resBodyText
                  : `[Binary Data${resBodySize ? `: body streamed` : ""}]`,
                latency,
              };
              this.sendTrafficLog(log);
            };

            if (captureReqBody && !reqBodyCaptured) {
              setTimeout(sendLog, 30);
            } else {
              sendLog();
            }
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
          reqBody: reqBodyCaptured ? reqBodyText : "",
          statusCode: 502,
          resBody: `Error forwarding to port ${targetPort}: ${err.message}`,
          latency,
        });
      });

      // Pipe incoming request body to proxy request
      req.on("data", (chunk: Buffer) => {
        proxyReq.write(chunk);
      });
      req.on("end", () => {
        proxyReq.end();
      });
      req.on("error", (err) => {
        proxyReq.destroy();
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
