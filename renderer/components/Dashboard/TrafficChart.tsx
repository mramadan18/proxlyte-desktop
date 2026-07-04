import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTunnelStore } from "../../store/tunnelStore";

interface DataPoint {
  time: string;
  download: number; // kbps
  upload: number; // kbps
}

export function TrafficChart() {
  const [data, setData] = useState<DataPoint[]>([]);
  const [stats, setStats] = useState({ dl: 0, ul: 0 });

  useEffect(() => {
    // Generate initial flat data
    const initialData = Array.from({ length: 15 }).map(() => ({
      time: "",
      download: 0,
      upload: 0,
    }));
    setData(initialData);

    let lastDownload = 0;
    let lastUpload = 0;

    // Listen to real-time traffic data from electron
    let unsubscribe: (() => void) | undefined;
    if (typeof window !== "undefined" && window.api && window.api.onTrafficData) {
      unsubscribe = window.api.onTrafficData((download, upload) => {
        lastDownload = Math.round(download);
        lastUpload = Math.round(upload);
        setStats({ dl: lastDownload, ul: lastUpload });
      });
    }

    const interval = setInterval(() => {
      setData((currentData) => {
        const newData = [...currentData.slice(1)];
        const now = new Date();
        const timeLabel = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
        
        const isRunning = useTunnelStore.getState().tunnels.some((t) => t.status === "running");
        
        if (isRunning) {
          newData.push({
            time: timeLabel,
            download: lastDownload,
            upload: lastUpload,
          });
        } else {
          newData.push({
            time: timeLabel,
            download: 0,
            upload: 0,
          });
        }
        return newData;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const isRunning = useTunnelStore().tunnels.some((t) => t.status === "running" || t.status === "starting");

  return (
    <div className="w-full bg-black/30 backdrop-blur-md border border-white/5 hover:border-white/10 rounded-xl p-2.5 transition-all duration-300 relative overflow-hidden group shadow-lg">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-violet-500/10 transition-colors"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? "bg-emerald-400 animate-pulse shadow-[0_0_6px_var(--color-emerald-400)]" : "bg-neutral-600"}`} />
          <span className="text-[10px] font-bold tracking-wider uppercase text-white/70">Telemetry</span>
        </div>
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-white/5 text-white/50 border border-white/5">
          KB/s
        </span>
      </div>

      {/* Live Bandwidth Numbers */}
      <div className="grid grid-cols-2 gap-1.5 mb-2 relative z-10">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1 flex flex-col justify-center min-w-0">
          <span className="text-[8px] text-emerald-400/70 font-bold uppercase tracking-wider">Down</span>
          <span className="text-[11px] font-extrabold text-emerald-400 truncate">↓ {stats.dl}</span>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2 py-1 flex flex-col justify-center min-w-0">
          <span className="text-[8px] text-indigo-400/70 font-bold uppercase tracking-wider">Up</span>
          <span className="text-[11px] font-extrabold text-indigo-400 truncate">↑ {stats.ul}</span>
        </div>
      </div>

      {/* Mini Area Chart - with explicit minHeight & minWidth to fix Recharts warning! */}
      <div className="h-10 w-full min-h-[40px] min-w-[100px] relative z-10 -mx-1 -mb-1">
        <ResponsiveContainer width="100%" height={40} minWidth={100} minHeight={40}>
          <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="sidebarColorDown" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sidebarColorUp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide domain={[0, 'dataMax + 10']} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(10, 10, 15, 0.9)', 
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '6px',
                fontSize: '10px',
                padding: '4px 8px',
                backdropFilter: 'blur(8px)'
              }}
              itemStyle={{ color: '#e2e8f0', padding: 0 }}
              labelStyle={{ display: 'none' }}
            />
            <Area type="monotone" dataKey="download" stroke="#34d399" strokeWidth={1.5} fillOpacity={1} fill="url(#sidebarColorDown)" isAnimationActive={false} />
            <Area type="monotone" dataKey="upload" stroke="#818cf8" strokeWidth={1.5} fillOpacity={1} fill="url(#sidebarColorUp)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
