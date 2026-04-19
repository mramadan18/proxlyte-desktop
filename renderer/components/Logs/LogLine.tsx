import { useState } from "react";
import { Play, ChevronDown, ChevronRight } from "lucide-react";

import { useTunnelStore } from "../../store/tunnelStore";

interface LogLineProps {
  log: {
    time: string;
    type: string;
    message: string;
    details?: {
      method: string;
      path: string;
      headers: Record<string, string | undefined>;
      body: string;
    }
  };
}

export const LogLine = ({ log }: LogLineProps) => {
  const [expanded, setExpanded] = useState(false);
  const { tunnels } = useTunnelStore();
  const hasDetails = !!log.details;

  const handleReplay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!log.details) return;

    const runningTunnel = tunnels.find((t) => t.status === "running") || tunnels[0];
    const port = runningTunnel?.port || "3000";
    const url = `http://localhost:${port}${log.details.path}`;

    try {
      await fetch(url, {
        method: log.details.method,
        headers: log.details.headers as Record<string, string>,
        body: log.details.method !== "GET" && log.details.method !== "HEAD" ? log.details.body : undefined,
      });
      // We don't necessarily need to show the result here, as it will trigger a new log line if successful
    } catch (err) {
      console.error("Replay failed:", err);
    }
  };

  return (
    <div className={`flex flex-col rounded-lg transition-all duration-300 ${hasDetails ? 'cursor-pointer hover:bg-white/5' : 'hover:bg-white/3'}`}>
      <div 
        className="flex gap-3.5 group px-2 py-1.5 -mx-2 items-center"
        onClick={() => hasDetails && setExpanded(!expanded)}
      >
        <span className="text-white/20 shrink-0 select-none font-medium text-[11.5px] w-[60px]">[{log.time}]</span>
        <span className={`shrink-0 min-w-[65px] h-5 font-black text-[9px] tracking-widest px-2 rounded-md flex items-center justify-center uppercase border
          ${log.type === 'INFO' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
            log.type === 'SUCCESS' ? 'text-green-400 bg-green-500/10 border-green-500/20' :
            log.type === 'WARN' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' : 
            log.type === 'DEBUG' ? 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20' :
            'text-red-400 bg-red-500/10 border-red-500/20'
          }
        `}>
          {log.type}
        </span>
        <span className={`flex-1 whitespace-pre-wrap break-all leading-relaxed font-light group-hover:text-white transition-colors text-[12.5px] line-clamp-1
          ${log.type === 'SUCCESS' ? 'text-green-400' :
            log.type === 'WARN' ? 'text-yellow-400/80' : 
            log.type === 'ERROR' ? 'text-red-400' :
            'text-white/70'
          }
        `}>{log.message}</span>
        {hasDetails && (
          <span className="shrink-0 text-white/30 ml-2">
             {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </span>
        )}
      </div>

      {expanded && log.details && (
        <div className="ml-[70px] mr-2 mb-3 mt-1 p-3 rounded-lg bg-black/40 border border-white/5 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white truncate max-w-[200px] sm:max-w-xs block">
                {log.details.method} {log.details.path}
              </span>
            </div>
            <button 
              onClick={handleReplay}
              className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-md transition-colors text-[10px] font-bold uppercase tracking-wider border border-indigo-500/30"
            >
              <Play className="w-3 h-3" /> Replay
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Headers</h4>
              <div className="bg-black/30 rounded p-2 text-[11px] font-mono text-white/70 space-y-1">
                {Object.entries(log.details.headers).map(([key, val]) => (
                  <div key={key} className="break-all">
                    <span className="text-indigo-300">{key}:</span> {val}
                  </div>
                ))}
              </div>
            </div>
            {log.details.body && (
              <div>
                <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Body</h4>
                <div className="bg-black/30 rounded p-2 text-[11px] font-mono text-white/70 whitespace-pre-wrap">
                  {log.details.body}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
