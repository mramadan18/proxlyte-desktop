import { create } from "zustand";

interface ServerState {
  isRunning: boolean;
  serverStatus: "running" | "stopped";
  toggleServer: () => void;
}

export const useServerStore = create<ServerState>((set) => ({
  isRunning: false,
  serverStatus: "stopped",
  toggleServer: async () => {
    const { isRunning } = useServerStore.getState();
    const nextIsRunning = !isRunning;

    if (typeof window !== "undefined" && window.api) {
      if (nextIsRunning) {
        await window.api.startServer();
      } else {
        await window.api.stopServer();
      }
    }

    set({
      isRunning: nextIsRunning,
      serverStatus: nextIsRunning ? "running" : "stopped",
    });
  },
}));
