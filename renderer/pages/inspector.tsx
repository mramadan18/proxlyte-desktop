import Head from "next/head";
import { useState } from "react";
import { useTrafficStore, TrafficRequestLog } from "../store/trafficStore";
import { useTunnelStore } from "../store/tunnelStore";
import { Eye, Search, Trash2, Play, RefreshCw, Check, ArrowRight, CornerDownRight } from "lucide-react";

export default function InspectorPage() {
  const { requests, clearRequests, activeRequestId, setActiveRequestId } = useTrafficStore();
  const { tunnels } = useTunnelStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"headers" | "body" | "response">("headers");
  const [replaying, setReplaying] = useState(false);
  const [replaySuccess, setReplaySuccess] = useState(false);

  const activeRequest = requests.find((r) => r.id === activeRequestId);

  const filteredRequests = requests.filter((r) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      r.path.toLowerCase().includes(query) ||
      r.method.toLowerCase().includes(query) ||
      (r.statusCode && r.statusCode.toString().includes(query))
    );
  });

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "GET":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "POST":
        return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
      case "PUT":
      case "PATCH":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "DELETE":
        return "text-rose-400 bg-rose-500/10 border-rose-500/20";
      default:
        return "text-white/60 bg-white/5 border-white/10";
    }
  };

  const getStatusColor = (status?: number) => {
    if (!status) return "text-white/40 bg-white/5 border-white/10";
    if (status >= 200 && status < 300) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (status >= 300 && status < 400) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  const handleReplay = async (req: TrafficRequestLog) => {
    if (replaying) return;
    setReplaying(true);
    setReplaySuccess(false);

    const associatedTunnel = tunnels.find((t) => t.id === req.tunnelId);
    const targetPort = associatedTunnel?.port || "3000";
    const url = `http://localhost:${targetPort}${req.path}`;

    try {
      const headersInit: Record<string, string> = {};
      Object.entries(req.reqHeaders).forEach(([key, val]) => {
        if (typeof val === "string") {
          headersInit[key] = val;
        } else if (Array.isArray(val)) {
          headersInit[key] = val.join(", ");
        }
      });

      // Avoid caching or special proxy loops in custom replay
      delete headersInit["host"];
      delete headersInit["connection"];

      await fetch(url, {
        method: req.method,
        headers: headersInit,
        body: req.method !== "GET" && req.method !== "HEAD" && req.reqBody && !req.reqBody.startsWith("[Binary Data")
          ? req.reqBody
          : undefined,
      });

      setReplaySuccess(true);
      setTimeout(() => setReplaySuccess(false), 2000);
    } catch (err) {
      console.error("Replay request failed", err);
    } finally {
      setReplaying(false);
    }
  };

  const formatHeaders = (headers?: Record<string, any>) => {
    if (!headers) return null;
    return Object.entries(headers).map(([key, val]) => (
      <div key={key} className="flex py-1.5 border-b border-white/3 font-mono text-[11px] break-all leading-normal">
        <span className="text-indigo-400 font-semibold w-32 shrink-0 select-all">{key}:</span>
        <span className="text-white/80 select-all flex-1">{String(val)}</span>
      </div>
    ));
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 h-full min-h-[calc(100vh-8rem)] pb-8 overflow-hidden">
      <Head>
        <title>Traffic Inspector - Proxlyte</title>
      </Head>

      {/* Title section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex flex-col gap-1 sm:gap-1.5">
          <h1 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-br from-white to-white/60 tracking-tight">
            Traffic Inspector
          </h1>
          <p className="text-white/40 text-[12px] font-medium max-w-lg">
            Monitor and replay local HTTP request payloads and pipeline latency in real-time.
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative group/search bg-white/2 border border-white/10 focus-within:border-indigo-500/50 rounded-xl flex items-center h-10 px-3 w-full sm:w-60 transition-all duration-300">
            <Search className="w-4 h-4 text-white/30 group-focus-within/search:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Filter requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none text-white text-xs ps-2 outline-none font-medium placeholder:text-white/20"
            />
          </div>
          <button
            onClick={clearRequests}
            disabled={requests.length === 0}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 hover:border-rose-500/20 hover:bg-rose-500/10 text-white/40 hover:text-rose-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
            title="Clear traffic logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 relative">
        {/* List of Requests Pane */}
        <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl flex flex-col min-h-[300px] lg:min-h-0 lg:max-w-md overflow-hidden backdrop-blur-md">
          <div className="px-4 py-3 bg-white/2 border-b border-white/5 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Requests Log ({filteredRequests.length})</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredRequests.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center gap-3">
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-full animate-pulse-slow">
                  <Eye className="w-6 h-6 text-indigo-400/40" />
                </div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">Listening for requests</p>
                <p className="text-[11px] text-white/20 max-w-xs leading-normal">
                  Trigger HTTP calls to your tunnel link (e.g. via browser or Postman) to see live headers, payloads, and response metadata.
                </p>
              </div>
            ) : (
              filteredRequests.map((req) => {
                const isActive = req.id === activeRequestId;
                const date = new Date(req.timestamp);
                const timeStr = date.toLocaleTimeString("en-US", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                });

                return (
                  <button
                    key={req.id}
                    onClick={() => {
                      setActiveRequestId(req.id);
                      setActiveTab("headers");
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-200 outline-none
                      ${
                        isActive
                          ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.08)]"
                          : "bg-transparent border-transparent hover:bg-white/3 hover:border-white/5"
                      }
                    `}
                  >
                    {/* Method Badge */}
                    <span className={`w-14 text-[9px] font-black tracking-wider uppercase border rounded-md py-1 flex items-center justify-center shrink-0 ${getMethodColor(req.method)}`}>
                      {req.method}
                    </span>

                    {/* Status Code */}
                    <span className={`w-10 text-[9px] font-black uppercase border rounded-md py-1 flex items-center justify-center shrink-0 ${getStatusColor(req.statusCode)}`}>
                      {req.statusCode || "---"}
                    </span>

                    {/* Path */}
                    <span className="flex-1 text-xs font-semibold text-white/80 truncate font-mono select-all">
                      {req.path}
                    </span>

                    {/* Meta info */}
                    <div className="flex flex-col items-end gap-0.5 shrink-0 text-[10px] text-white/30 font-mono">
                      <span>{timeStr}</span>
                      {req.latency !== undefined && (
                        <span className="text-emerald-400/80 font-bold">{req.latency}ms</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Detail Pane */}
        <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl flex flex-col overflow-hidden backdrop-blur-md">
          {activeRequest ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Header section with Replay and Summary */}
              <div className="px-5 py-4 bg-white/2 border-b border-white/5 flex items-center justify-between gap-4 shrink-0">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 border text-[9px] font-black tracking-wider rounded uppercase ${getMethodColor(activeRequest.method)}`}>
                      {activeRequest.method}
                    </span>
                    <span className="font-mono text-xs font-bold text-white/95 truncate select-all">
                      {activeRequest.path}
                    </span>
                  </div>
                  <div className="text-[10px] text-white/40 font-mono flex items-center gap-2">
                    <span>Target Port: {tunnels.find((t) => t.id === activeRequest.tunnelId)?.port || "3000"}</span>
                    <span>•</span>
                    <span>Received: {new Date(activeRequest.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleReplay(activeRequest)}
                    disabled={replaying}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border
                      ${
                        replaySuccess
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 active:scale-95"
                      }
                    `}
                    title="Send this request again to local port"
                  >
                    {replaying ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : replaySuccess ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                    {replaySuccess ? "Replayed!" : "Replay"}
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="px-4 bg-white/1 border-b border-white/5 flex gap-1 shrink-0">
                <button
                  onClick={() => setActiveTab("headers")}
                  className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all outline-none
                    ${
                      activeTab === "headers"
                        ? "border-indigo-500 text-indigo-400"
                        : "border-transparent text-white/40 hover:text-white/60"
                    }
                  `}
                >
                  Headers
                </button>
                <button
                  onClick={() => setActiveTab("body")}
                  className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all outline-none
                    ${
                      activeTab === "body"
                        ? "border-indigo-500 text-indigo-400"
                        : "border-transparent text-white/40 hover:text-white/60"
                    }
                  `}
                >
                  Request Body
                </button>
                <button
                  onClick={() => setActiveTab("response")}
                  className={`px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all outline-none
                    ${
                      activeTab === "response"
                        ? "border-indigo-500 text-indigo-400"
                        : "border-transparent text-white/40 hover:text-white/60"
                    }
                  `}
                >
                  Response Body
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-black/10">
                {activeTab === "headers" && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <CornerDownRight className="w-3.5 h-3.5" /> Request Headers
                      </h4>
                      <div className="bg-black/30 border border-white/3 rounded-xl p-4">
                        {formatHeaders(activeRequest.reqHeaders)}
                      </div>
                    </div>
                    {activeRequest.resHeaders && (
                      <div>
                        <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                          <ArrowRight className="w-3.5 h-3.5" /> Response Headers
                        </h4>
                        <div className="bg-black/30 border border-white/3 rounded-xl p-4">
                          {formatHeaders(activeRequest.resHeaders)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "body" && (
                  <div className="h-full flex flex-col">
                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">Request Payload</h4>
                    {activeRequest.reqBody ? (
                      <pre className="flex-1 bg-black/40 border border-white/3 rounded-xl p-4 font-mono text-[11px] text-white/80 overflow-auto whitespace-pre-wrap select-all leading-normal">
                        {activeRequest.reqBody}
                      </pre>
                    ) : (
                      <div className="flex-1 flex items-center justify-center p-8 bg-black/20 border border-dashed border-white/5 rounded-xl text-white/20 text-xs font-semibold uppercase tracking-wider">
                        Empty Payload (No Body)
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "response" && (
                  <div className="h-full flex flex-col">
                    <h4 className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3">Response Payload</h4>
                    {activeRequest.resBody ? (
                      <pre className="flex-1 bg-black/40 border border-white/3 rounded-xl p-4 font-mono text-[11px] text-white/80 overflow-auto whitespace-pre-wrap select-all leading-normal">
                        {activeRequest.resBody}
                      </pre>
                    ) : (
                      <div className="flex-1 flex items-center justify-center p-8 bg-black/20 border border-dashed border-white/5 rounded-xl text-white/20 text-xs font-semibold uppercase tracking-wider">
                        No Response Body Captured
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
              <Eye className="w-10 h-10 text-white/10 animate-pulse-slow" />
              <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">Select a request</p>
              <p className="text-[11px] text-white/20 max-w-[240px] leading-normal">
                Click any request in the left list pane to inspect detailed payload headers, request bodies, and responses.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
