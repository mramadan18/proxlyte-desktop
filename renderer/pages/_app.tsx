import type { AppProps } from "next/app";
import { useEffect } from "react";
import { Layout } from "../components/Layout";
import { useTunnelStore } from "../store/tunnelStore";
import { useLogsStore } from "../store/logsStore";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import "../styles/global.css";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    useTunnelStore.getState().setupListeners();
    useLogsStore.getState().setupListeners();
  }, []);

  return (
    <Layout>
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
