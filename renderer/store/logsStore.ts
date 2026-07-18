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
  tunnelId?: string;
  details?: LogDetail;
}

/**
 * Maximum number of logs to keep in memory to prevent unbounded growth.
 */
const MAX_LOGS = 500;

interface LogsState {
  logs: TunnelLog[];
  addLog: (log: TunnelLog) => void;
  clearLogs: () => void;
  getCurrentTimestamp: () => string;
  setupListeners: () => void;
}

export const useLogsStore = create<LogsState>((set) => ({
  logs: [],

  addLog: (log) =>
    set((state) => {
      const next = [...state.logs, log];
      // Keep only the last MAX_LOGS entries and hard-cap at MAX_LOGS + 50
      if (next.length > MAX_LOGS) {
        return { logs: next.slice(next.length - MAX_LOGS) };
      }
      return { logs: next };
    }),

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
      window.api.onTunnelLog((tunnelId: string, log: string) => {
        set((state) => {
          const next = [
            ...state.logs,
            {
              time: state.getCurrentTimestamp(),
              type: "INFO",
              message: log,
              tunnelId,
            },
          ];
          if (next.length > MAX_LOGS) {
            return { logs: next.slice(next.length - MAX_LOGS) };
          }
          return { logs: next };
        });
      });
    }
  },
}));
