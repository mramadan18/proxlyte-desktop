import { create } from "zustand";

export interface TrafficRequestLog {
  id: string;
  tunnelId: string;
  timestamp: number;
  method: string;
  path: string;
  reqHeaders: Record<string, string | string[] | undefined>;
  reqBody: string;
  statusCode?: number;
  resHeaders?: Record<string, string | string[] | undefined>;
  resBody?: string;
  latency?: number;
}

interface TrafficState {
  requests: TrafficRequestLog[];
  activeRequestId: string | null;
  addRequest: (log: TrafficRequestLog) => void;
  clearRequests: () => void;
  setActiveRequestId: (id: string | null) => void;
  setupListeners: () => () => void;
}

export const useTrafficStore = create<TrafficState>((set, get) => ({
  requests: [],
  activeRequestId: null,
  addRequest: (log) => {
    set((state) => {
      // Limit to last 200 requests to avoid memory bloat
      const newRequests = [log, ...state.requests];
      if (newRequests.length > 200) {
        newRequests.pop();
      }
      return { requests: newRequests };
    });
  },
  clearRequests: () => set({ requests: [], activeRequestId: null }),
  setActiveRequestId: (id) => set({ activeRequestId: id }),
  setupListeners: () => {
    if (typeof window !== "undefined" && window.api && window.api.onTrafficRequest) {
      const cleanup = window.api.onTrafficRequest((log: any) => {
        get().addRequest(log);
      });
      return cleanup;
    }
    return () => {};
  },
}));
