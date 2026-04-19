import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useUpdateStore } from "../../store/useUpdateStore";

export const UpdateNotification = () => {
  const { status, setStatus } = useUpdateStore();

  if (status !== "downloaded") return null;

  const handleInstall = () => {
    if (typeof window !== "undefined" && window.api) {
      window.api.installUpdate();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-100 w-full max-w-md px-4"
      >
        <div className="bg-emerald-600 border border-emerald-500/50 shadow-2xl shadow-emerald-900/40 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <h4 className="text-sm font-bold text-white">Update Ready!</h4>
              <p className="text-[11px] text-white/80 font-medium">
                New version is downloaded and ready to install.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-white text-emerald-700 text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-emerald-50/90 transition-colors shadow-sm"
            >
              Install Now
            </button>
            <button
              onClick={() => setStatus("idle")}
              className="p-2 hover:bg-black/10 rounded-lg transition-colors text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
