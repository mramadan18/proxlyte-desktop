import { create } from "zustand";

export interface LogDetail {
  method: string;
  path: string;
  headers: Record<string, string | undefined>;
  body: string;
}

export interface TunnelLog {
  time: string;
  type: string;
  message: string;
  details?: LogDetail;
}

interface LogsState {
  logs: TunnelLog[];
  addLog: (log: TunnelLog) => void;
  clearLogs: () => void;
  getCurrentTimestamp: () => string;
  setupListeners: () => void;
}

export const useLogsStore = create<LogsState>((set) => ({
  logs: [],
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
  clearLogs: () => set({ logs: [] }),
  getCurrentTimestamp: () => {
    return new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  },
  setupListeners: () => {
    if (typeof window !== "undefined" && window.api) {
      window.api.onTunnelLog((log: string) => {
        set((state) => ({
          logs: [
            ...state.logs,
            {
              time: state.getCurrentTimestamp(),
              type: "INFO",
              message: log,
            },
          ],
        }));
      });
    }
  },
}));
