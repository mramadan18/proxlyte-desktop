import type { AppProps } from "next/app";
import { useEffect } from "react";
import { Layout } from "../components/Layout";
import { useTunnelStore } from "../store/tunnelStore";
import { useLogsStore } from "../store/logsStore";
import { useTrafficStore } from "../store/trafficStore";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { UpdateNotification } from "../components/Updates/UpdateNotification";
import "../styles/global.css";

import { useUpdateHandlers } from "../hooks/useUpdateHandlers";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useUpdateHandlers();

  useEffect(() => {
    useTunnelStore.getState().setupListeners();
    useLogsStore.getState().setupListeners();
    const cleanupTraffic = useTrafficStore.getState().setupListeners();

    let cleanupStopAll: (() => void) | undefined;
    let cleanupQuickTunnel: (() => void) | undefined;

    if (typeof window !== "undefined" && window.api) {
      cleanupStopAll = window.api.onTriggerStopAll?.(() => {
        if (window.api && window.api.stopAllTunnels) {
          window.api.stopAllTunnels();
        }
        const tunnels = useTunnelStore.getState().tunnels;
        tunnels.forEach((t) => {
          if (t.status === "running" || t.status === "starting") {
            useTunnelStore.getState().updateTunnel(t.id, { status: "stopped", publicUrl: undefined });
          }
        });
      });

      cleanupQuickTunnel = window.api.onTriggerQuickTunnel?.((port: string) => {
        const tunnels = useTunnelStore.getState().tunnels;
        const existing = tunnels.find((t) => t.port === port && t.status === "stopped");
        if (existing) {
          useTunnelStore.getState().toggleTunnelStatus(existing.id);
        } else {
          useTunnelStore.getState().addTunnel();
          setTimeout(() => {
            const currentTunnels = useTunnelStore.getState().tunnels;
            const newTunnel = currentTunnels[currentTunnels.length - 1];
            if (newTunnel) {
              useTunnelStore.getState().updateTunnel(newTunnel.id, { port });
              useTunnelStore.getState().toggleTunnelStatus(newTunnel.id);
            }
          }, 100);
        }
      });
    }

    return () => {
      if (cleanupTraffic) cleanupTraffic();
      if (cleanupStopAll) cleanupStopAll();
      if (cleanupQuickTunnel) cleanupQuickTunnel();
    };
  }, []);

  const isTray = router.pathname === "/tray";

  if (isTray) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={router.pathname}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="h-screen w-screen overflow-hidden select-none bg-transparent"
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <Layout>
      <UpdateNotification />
      <AnimatePresence mode="wait">
        <motion.div
          key={router.pathname}
          initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="h-full w-full"
        >
          <Component {...pageProps} />
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

export default MyApp;
