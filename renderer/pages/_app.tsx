import type { AppProps } from "next/app";
import { useEffect } from "react";
import { Layout } from "../components/Layout";
import { useTunnelStore } from "../store/tunnelStore";
import { useLogsStore } from "../store/logsStore";
import { useTrafficStore } from "../store/trafficStore";
import { useSettingsStore } from "../store/settingsStore";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import { UpdateNotification } from "../components/Updates/UpdateNotification";
import "../styles/global.css";

import { useUpdateHandlers } from "../hooks/useUpdateHandlers";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { settings } = useSettingsStore();
  useUpdateHandlers();

  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = settings.theme || (settings.darkMode === false ? "light" : "dark");

    const applyTheme = () => {
      let isDark = true;
      if (currentTheme === "system") {
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      } else {
        isDark = currentTheme === "dark";
      }

      if (isDark) {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
      }
    };

    applyTheme();

    if (currentTheme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme();
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
    return;
  }, [settings.theme, settings.darkMode]);

  useEffect(() => {
    useTunnelStore.getState().setupListeners();
    useLogsStore.getState().setupListeners();
    const cleanupTraffic = useTrafficStore.getState().setupListeners();

    return () => {
      if (cleanupTraffic) cleanupTraffic();
    };
  }, []);

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
