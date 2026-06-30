import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useTunnelStore } from "../../store/tunnelStore";

interface DataPoint {
  time: string;
  download: number; // kbps
  upload: number; // kbps
}

export function TrafficChart() {
  const { tunnels } = useTunnelStore();
  const isAnyTunnelRunning = tunnels.some((t) => t.status === "running");

  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    // Generate initial flat data
    const initialData = Array.from({ length: 20 }).map((_, i) => ({
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
      });
    }

    const interval = setInterval(() => {
      setData((currentData) => {
        const newData = [...currentData.slice(1)];
        const now = new Date();
        const timeLabel = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
        
        if (isAnyTunnelRunning) {
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
  }, [isAnyTunnelRunning]);

  return (
    <div className="w-full bg-(--glass-bg) backdrop-blur-md border border-(--glass-border) rounded-2xl p-5 mb-6 shadow-sm relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-(--text-main)">Network Traffic</h2>
          <p className="text-[10px] text-(--text-muted) uppercase tracking-wider font-semibold mt-0.5">Live Bandwidth (KB/s)</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_var(--color-emerald-400)]"></span>
            <span className="text-[10px] text-(--text-muted) font-medium">Download</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_var(--color-indigo-400)]"></span>
            <span className="text-[10px] text-(--text-muted) font-medium">Upload</span>
          </div>
        </div>
      </div>

      <div className="h-48 w-full relative z-10 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide domain={[0, 'dataMax + 20']} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(10, 10, 15, 0.8)', 
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontSize: '12px',
                backdropFilter: 'blur(8px)'
              }}
              itemStyle={{ color: '#e2e8f0' }}
            />
            <Area type="monotone" dataKey="download" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorDown)" isAnimationActive={false} />
            <Area type="monotone" dataKey="upload" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorUp)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
