import { spawn, exec, execSync, ChildProcess } from "child_process";
import { EventEmitter } from "events";
import fs from "fs";
import path from "path";
import os from "os";
import { app } from "electron";

export class CloudflaredService extends EventEmitter {
  private currentProcess: ChildProcess | null = null;

  constructor() {
    super();
  }

  private getCommand(): string {
    const isProd = app.isPackaged;
    if (isProd) {
      const binaryName =
        os.platform() === "win32" ? "cloudflared.exe" : "cloudflared";
      const bundledPath = path.join(process.resourcesPath, "bin", binaryName);
      if (fs.existsSync(bundledPath)) {
        return bundledPath;
      }
    }
    return "cloudflared";
  }

  public async isAuthenticated(): Promise<boolean> {
    const cloudflaredDir = path.join(os.homedir(), ".cloudflared");
    const certPath = path.join(cloudflaredDir, "cert.pem");
    return fs.existsSync(certPath);
  }

  public checkInstallation(): Promise<boolean> {
    const cmd = this.getCommand();
    return new Promise((resolve) => {
      exec(`${cmd} --version`, (error) => {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  public login(): Promise<void> {
    return new Promise((resolve, reject) => {
      const cmd = this.getCommand();
      const loginProcess = spawn(cmd, ["tunnel", "login"]);

      loginProcess.stdout?.on("data", (data) => {
        this.emit("log", data.toString());
      });

      loginProcess.stderr?.on("data", (data) => {
        this.emit("log", data.toString());
      });

      loginProcess.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Login process exited with code ${code}`));
        }
      });
    });
  }

  public async startQuickTunnel(port: number, metricsPort?: number): Promise<void> {
    if (this.currentProcess) {
      this.currentProcess.kill();
    }

    const cmd = this.getCommand();
    const args = ["tunnel", "--url", `http://localhost:${port}`];
    if (metricsPort) {
      args.push("--metrics", `127.0.0.1:${metricsPort}`);
    }
    this.currentProcess = spawn(cmd, args);

    this.currentProcess.stdout?.on("data", (data) => {
      const output = data.toString();
      this.emit("log", output);
      this.parseUrl(output);
    });

    this.currentProcess.stderr?.on("data", (data) => {
      const output = data.toString();
      this.emit("log", output);
      this.parseUrl(output);
    });

    this.currentProcess.on("close", (code) => {
      this.emit("close", code);
      this.currentProcess = null;
    });
  }

  public async startCustomTunnel(domain: string, port: number, metricsPort?: number): Promise<void> {
    if (this.currentProcess) {
      this.currentProcess.kill();
    }

    const cmd = this.getCommand();
    const tunnelName = domain.replace(/\./g, "-");

    try {
      try {
        execSync(`${cmd} tunnel delete -f ${tunnelName}`, {
          stdio: "ignore",
        });
      } catch (e) {
        // ignore fail
      }

      const createOutput = execSync(
        `${cmd} tunnel create ${tunnelName} 2>&1`,
      ).toString();
      const idMatch = createOutput.match(
        /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
      );

      if (!idMatch) {
        this.emit("error", "Failed to extract tunnel ID.");
        return;
      }

      const tunnelId = idMatch[1];
      const cloudflaredDir = path.join(os.homedir(), ".cloudflared");
      const credPath = path.join(cloudflaredDir, `${tunnelId}.json`);
      const configPath = path.join(cloudflaredDir, `config_${tunnelName}.yml`);

      const configContent = `tunnel: ${tunnelId}
credentials-file: ${credPath}

ingress:
  - hostname: ${domain}
    service: http://localhost:${port}
  - service: http_status:404
`;
      fs.writeFileSync(configPath, configContent);

      execSync(`${cmd} tunnel route dns -f ${tunnelName} ${domain}`, {
        stdio: "ignore",
      });

      const args = ["tunnel", "--config", configPath];
      if (metricsPort) {
        args.push("--metrics", `127.0.0.1:${metricsPort}`);
      }
      args.push("run", tunnelName);

      this.currentProcess = spawn(cmd, args);

      this.currentProcess.stdout?.on("data", (data) => {
        this.emit("log", data.toString());
      });

      this.currentProcess.stderr?.on("data", (data) => {
        const output = data.toString();
        this.emit("log", output);
        if (output.includes("INF Registered tunnel connection")) {
          this.emit("url", `https://${domain}`);
        }
        if (output.includes("ERR") || output.includes("error")) {
          this.emit("error", output);
        }
      });

      this.currentProcess.on("close", (code) => {
        this.emit("close", code);
        this.currentProcess = null;
      });
    } catch (error: any) {
      this.emit("log", error.message);
      this.emit("error", error.message);
    }
  }

  public stopTunnel() {
    if (this.currentProcess) {
      this.currentProcess.kill();
      this.currentProcess = null;
    }
  }

  private parseUrl(output: string) {
    const regex = /https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/g;
    const match = output.match(regex);
    if (match && match.length > 0) {
      this.emit("url", match[0]);
    }
  }
}
