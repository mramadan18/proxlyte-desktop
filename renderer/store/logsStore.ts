import { create } from "zustand";

export interface LogDetail {
  method: string;
  path: string;
  headers: Record<string, string | undefined>;
  body: string;
}

export interface MockLog {
  time: string;
  type: string;
  message: string;
  details?: LogDetail;
}

interface LogsState {
  logs: MockLog[];
  addLog: (log: MockLog) => void;
  clearLogs: () => void;
  getCurrentTimestamp: () => string;
}

export const useLogsStore = create<LogsState>((set) => ({
  logs: [
    { time: "10:23:01", type: "INFO", message: "Kernel boot process complete. Engine v2.1 online." },
    { time: "10:23:02", type: "INFO", message: "Activating reverse multiplexer bindings on 127.0.0.1:3001" },
    { time: "10:23:04", type: "WARN", message: "Buffer limits reaching 80%. Consider increasing allocation." },
    { time: "10:23:05", type: "INFO", message: "Initiating handshake with edge network routing fabric..." },
    { time: "10:23:06", type: "SUCCESS", message: "SECURE CHANNEL ESTABLISHED. Link latency: 12ms." },
    { time: "10:23:06", type: "INFO", message: "Ingress point provisioned: https://proxlyte.run/tunnel-xj9k" },
    { 
      time: "10:25:11", 
      type: "DEBUG", 
      message: "HTTP/2.0 GET /_next/static/css/styles.css (200 OK) -> 4.2ms",
      details: {
        method: "GET",
        path: "/_next/static/css/styles.css",
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Accept": "text/css,*/*;q=0.1" },
        body: ""
      }
    },
    { 
      time: "10:27:42", 
      type: "DEBUG", 
      message: "HTTP/2.0 POST /api/telemetry (202 Accepted) -> 22.8ms",
      details: {
        method: "POST",
        path: "/api/telemetry",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer token_123" },
        body: "{\n  \"event\": \"user_click\",\n  \"timestamp\": 1718029302\n}"
      }
    },
  ],
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  clearLogs: () => set({ logs: [] }),
  getCurrentTimestamp: () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  },
}));
