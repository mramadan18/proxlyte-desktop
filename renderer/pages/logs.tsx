import Head from "next/head";
import { LogLine } from "../components/Logs/LogLine";
import { TerminalHeader } from "../components/Logs/TerminalHeader";
import { useLogsStore } from "../store/logsStore";

export default function LogsPage() {
  const { logs } = useLogsStore();

  return (
    <div className="flex flex-col gap-4 sm:gap-6 h-full min-h-[calc(100vh-5.5rem)] pb-4">
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

            {logs.length === 0 && (
              <div className="flex flex-col items-center justify-center my-auto py-16 text-(--text-muted)/40 gap-2 text-center">
                <span className="text-xs font-mono tracking-wider">
                  No process logs recorded yet...
                </span>
                <span className="text-[10px] text-(--text-muted)/30">
                  Start a tunnel or perform an action to generate live
                  telemetry.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
