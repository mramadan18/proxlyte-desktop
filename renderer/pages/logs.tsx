import Head from "next/head";
import { Cpu } from "lucide-react";
import { LogLine } from "../components/Logs/LogLine";
import { TerminalHeader } from "../components/Logs/TerminalHeader";
import { useLogsStore } from "../store/logsStore";

export default function LogsPage() {
  const { logs, getCurrentTimestamp } = useLogsStore();

  return (
    <div className="flex flex-col gap-4 sm:gap-6 h-full min-h-[calc(100vh-8rem)] pb-8">
      <Head>
        <title>Console - Proxlyte</title>
      </Head>

      <div className="flex flex-col gap-1 sm:gap-1.5 shrink-0">
        <h1 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-br from-(--text-main) to-(--text-main)/60 tracking-tight">
          Console Output
        </h1>
        <p className="text-(--text-muted)/80 text-[12px] font-medium max-w-lg">
          Live process telemetry and system pipeline logs in real-time.
        </p>
      </div>

      <div className="relative group rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl flex-1 flex flex-col min-h-0 bg-black/50 border border-(--glass-highlight) backdrop-blur-md">
        <TerminalHeader />

        <div className="p-4 sm:p-6 font-mono text-[12px] sm:text-[14px] overflow-y-auto flex-1 selection:bg-fuchsia-500/30">
          <div className="space-y-1.5 min-h-full flex flex-col">
            {logs.map((log, i) => (
              <LogLine key={i} log={log} />
            ))}
            
            {/* Placeholder for future Bento items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-6">
              <div className="bg-(--glass-bg) border border-(--glass-highlight) rounded-xl sm:rounded-2xl p-4 sm:p-5 backdrop-blur-md flex flex-col justify-between aspect-auto sm:aspect-square">
                <span className="text-(--text-muted)/40 shrink-0 select-none font-medium mb-3 sm:mb-0 text-[10px] sm:text-[11px]">[{getCurrentTimestamp()}]</span>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 sm:w-2 h-3 sm:h-3.5 bg-fuchsia-400 shadow-[0_0_12px_rgba(232,121,249,0.8)] animate-pulse rounded-[1px]" />
                  <span className="text-[10px] font-black text-fuchsia-400/40 uppercase tracking-widest leading-none">Awaiting Instruction</span>
                </div>
              </div>
              <div className="bg-(--glass-bg) border border-(--glass-highlight) rounded-xl sm:rounded-2xl p-4 sm:p-5 backdrop-blur-md flex flex-col justify-between aspect-auto sm:aspect-square">
                <Cpu className="w-3.5 h-3.5 text-(--accent-fuchsia)/30 mb-3 sm:mb-0" />
                <p className="text-[9px] font-bold text-(--text-muted)/40 uppercase tracking-widest">Subsystem Status: Fully Operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
