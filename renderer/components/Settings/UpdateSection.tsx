import {
  RefreshCw,
  Download,
  ArrowUpCircle,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUpdateStore } from "../../store/useUpdateStore";

export const UpdateSection = () => {
  const { status, progress, version, setStatus } = useUpdateStore();

  const handleCheck = () => {
    if (typeof window !== "undefined" && window.api) {
      setStatus("checking");
      window.api.checkForUpdates();
    }
  };

  const handleInstall = () => {
    if (typeof window !== "undefined" && window.api) {
      window.api.installUpdate();
    }
  };

  return (
    <div className="relative group rounded-xl overflow-hidden shadow-2xl mt-4">
      <div className="bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/20 transition-all rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors duration-500 ${
                status === "downloaded"
                  ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/20"
                  : status === "error"
                    ? "bg-red-500/20 text-red-500 border-red-500/20"
                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              }`}
            >
              {status === "checking" && (
                <RefreshCw className="w-5 h-5 animate-spin" />
              )}
              {status === "downloading" && (
                <Download className="w-5 h-5 animate-bounce" />
              )}
              {status === "downloaded" && <CheckCircle2 className="w-5 h-5" />}
              {status === "error" && <AlertCircle className="w-5 h-5" />}
              {status === "available" && <ArrowUpCircle className="w-5 h-5" />}
              {(status === "idle" || status === "not-available") && (
                <Info className="w-5 h-5" />
              )}
            </div>

            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-emerald-400">
                Software Update
              </h3>
              <p className="text-[11px] font-medium text-emerald-400/50">
                {status === "idle" &&
                  "Check for new features and performance improvements."}
                {status === "checking" && "Scanning for updates..."}
                {status === "available" && `New version available: v${version}`}
                {status === "not-available" &&
                  "You are running the latest version."}
                {status === "downloading" &&
                  `Downloading update... ${Math.round(progress)}%`}
                {status === "downloaded" &&
                  "Update downloaded and ready to install."}
                {status === "error" && "Failed to check for updates."}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <AnimatePresence mode="wait">
              {status === "downloaded" ? (
                <motion.button
                  key="install"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={handleInstall}
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-black text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Restart & Install
                </motion.button>
              ) : (
                <motion.button
                  key="check"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={handleCheck}
                  disabled={status === "checking" || status === "downloading"}
                  className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                    status === "checking" || status === "downloading"
                      ? "bg-gray-500/10 text-gray-400 cursor-not-allowed opacity-50"
                      : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                  }`}
                >
                  {status === "checking" ? "Checking..." : "Check for Updates"}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Progress Bar for Downloading */}
        <AnimatePresence>
          {status === "downloading" && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: "auto", opacity: 1, marginTop: 16 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="h-1.5 w-full bg-emerald-500/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
