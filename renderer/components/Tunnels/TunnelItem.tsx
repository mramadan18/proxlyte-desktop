import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useTunnelStore, Tunnel } from "../../store/tunnelStore";
import { useSettingsStore } from "../../store/settingsStore";
import {
  Play,
  Square,
  Trash2,
  Link as LinkIcon,
  Copy,
  Check,
  ChevronDown,
} from "lucide-react";
import {
  Select,
  ListBox,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";

export function TunnelItem({ tunnel }: { tunnel: Tunnel }) {
  const { settings } = useSettingsStore();
  const { updateTunnel, removeTunnel, toggleTunnelStatus, isAuthenticated } =
    useTunnelStore();

  const [copied, setCopied] = useState(false);
  const [showPortDropdown, setShowPortDropdown] = useState(false);
  const commonPorts = settings.customPorts || [
    "3000",
    "5173",
    "8000",
    "8080",
    "5000",
  ];

  const isRunning = tunnel.status === "running" || tunnel.status === "starting";

  const handleCopyLink = () => {
    if (tunnel.publicUrl) {
      navigator.clipboard.writeText(tunnel.publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const customDomains = settings.customDomains || [];
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl h-[100px] md:h-[74px] bg-slate-50/90 dark:bg-white/2 border border-slate-200 dark:border-white/10 animate-pulse" />
    );
  }

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center gap-4 transition-all duration-300 ${
        isRunning
          ? "bg-emerald-500/3 dark:bg-emerald-500/2 border border-emerald-500/35 dark:border-emerald-500/25 shadow-[0_4px_20px_rgba(16,185,129,0.06)] dark:shadow-[0_0_15px_rgba(16,185,129,0.08)]"
          : "bg-slate-50/90 dark:bg-white/2 border border-slate-200 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-none hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]"
      }`}
    >
      {isRunning ? (
        <>
          {/* === RUNNING STATE UI === */}
          <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-3 min-w-0">
            {/* Live Badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold shrink-0">
              {tunnel.status === "starting" ? (
                <div className="relative flex h-2 w-2">
                  <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
              ) : (
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
              )}
              {tunnel.status === "starting"
                ? "Starting..."
                : `Live on Port ${tunnel.port || "3000"}`}
            </div>

            <div className="hidden sm:flex text-(--text-muted)/50">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>

            {/* Public URL Display */}
            {tunnel.publicUrl && (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium flex-1 min-w-0 transition-colors">
                <LinkIcon size={14} className="shrink-0" />
                <a
                  href={tunnel.publicUrl}
                  onClick={(e) => {
                    e.preventDefault();
                    if (
                      typeof window !== "undefined" &&
                      window.api &&
                      window.api.openExternal
                    ) {
                      window.api.openExternal(tunnel.publicUrl!);
                    }
                  }}
                  className="truncate hover:underline cursor-pointer flex-1 min-w-0 text-emerald-400"
                  title="Open in default browser"
                >
                  {tunnel.publicUrl?.replace("https://", "")}
                </a>
                <button
                  onClick={handleCopyLink}
                  className="p-1.5 hover:bg-emerald-400/20 active:scale-95 rounded-md transition-all shrink-0"
                  title="Copy link"
                >
                  {copied ? (
                    <Check
                      size={14}
                      className="text-emerald-400 animate-in zoom-in duration-200"
                    />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
            <button
              onClick={() => toggleTunnelStatus(tunnel.id)}
              className="flex items-center justify-center gap-2 px-6 h-10 rounded-xl text-sm font-bold transition-all w-full sm:w-auto bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)] hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]"
            >
              <Square size={14} fill="currentColor" />
              Stop
            </button>
          </div>
        </>
      ) : (
        <>
          {/* === STOPPED STATE UI === */}
          {tunnel.status === "error" && (
            <div className="text-rose-400 text-xs mb-2 bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20">
              Failed to start tunnel. Check configuration or logs.
            </div>
          )}
          <div className="flex-1 flex flex-col md:flex-row gap-4">
            <Popover
              isOpen={showPortDropdown}
              onOpenChange={setShowPortDropdown}
            >
              <PopoverTrigger>
                <div className="relative w-full md:max-w-[120px] shrink-0 flex items-center">
                  <Input
                    type="text"
                    placeholder="Port"
                    value={tunnel.port}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      updateTunnel(tunnel.id, { port: e.target.value });
                    }}
                    className="w-full h-10 rounded-xl bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/10 hover:border-black/25 dark:hover:border-white/20 focus-within:border-emerald-500/50 transition-all pl-4 pr-8 text-sm outline-none text-(--text-main) placeholder:text-neutral-400 dark:placeholder:text-white/20 font-medium"
                  />
                  <div className="absolute right-3 pointer-events-none text-(--text-muted)/50">
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-300 ${showPortDropdown ? "rotate-180" : ""}`}
                    />
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent
                placement="bottom start"
                offset={8}
                className="bg-(--bg-surface) border border-(--glass-border-light) rounded-xl shadow-2xl p-1 min-w-[120px] max-h-48 overflow-y-auto"
              >
                <ListBox
                  aria-label="Common Ports"
                  onAction={(key) => {
                    updateTunnel(tunnel.id, { port: key as string });
                    setShowPortDropdown(false);
                  }}
                  className="p-0"
                >
                  {commonPorts.map((port) => (
                    <ListBox.Item key={port} id={port} textValue={port}>
                      {port}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </PopoverContent>
            </Popover>

            <div className="flex gap-2 w-full">
              <Select
                aria-label="Domain Type"
                selectedKey={tunnel.domainType}
                onSelectionChange={(key) => {
                  const val = key as "random" | "custom";
                  if (val) {
                    updateTunnel(tunnel.id, {
                      domainType: val,
                      baseDomain:
                        val === "custom" ? customDomains[0] || "" : "",
                    });
                  }
                }}
                className="basis-2/5 min-w-40"
              >
                <Select.Trigger className="h-10 min-h-10 rounded-xl bg-black/5 dark:bg-white/5 border border-black/15 dark:border-white/10 hover:border-black/25 dark:hover:border-white/20 data-[hover=true]:border-black/25 data-[hover=true]:dark:border-white/20 data-[focus-visible=true]:border-emerald-500/50 data-[open=true]:border-emerald-500/50 transition-all px-3 flex items-center justify-between outline-none">
                  <Select.Value className="text-(--text-main) text-sm font-medium" />
                  <Select.Indicator className="text-black/40 dark:text-white/40" />
                </Select.Trigger>
                <Select.Popover className="bg-(--bg-surface) border border-(--glass-border-light) rounded-xl shadow-2xl p-1 min-w-[160px]">
                  <ListBox className="p-0">
                    <ListBox.Item id="random" textValue="Random Link">
                      Random Link
                    </ListBox.Item>
                    <ListBox.Item
                      id="custom"
                      textValue="Custom Domain"
                      isDisabled={!isAuthenticated}
                    >
                      Custom Domain {!isAuthenticated ? "(Requires Auth)" : ""}
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>

              {tunnel.domainType === "custom" && customDomains.length > 0 && (
                <div className="flex-1 flex items-center border border-black/15 dark:border-white/10 rounded-xl bg-black/5 dark:bg-white/5 overflow-hidden focus-within:border-emerald-500/50 focus-within:bg-black/10 dark:focus-within:bg-white/10 transition-all h-10">
                  <Input
                    type="text"
                    placeholder="app"
                    value={tunnel.subdomain}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const val = e.target.value;
                      if (/^[a-z0-9-]*$/.test(val)) {
                        updateTunnel(tunnel.id, { subdomain: val });
                      }
                    }}
                    className="w-full px-3 text-sm outline-none bg-transparent text-(--text-main) placeholder:text-neutral-400 dark:placeholder-neutral-500 min-w-0"
                  />
                  <span className="text-(--text-muted) px-1 text-sm font-medium">
                    .
                  </span>
                  <Select
                    aria-label="Base Domain"
                    selectedKey={tunnel.baseDomain}
                    onSelectionChange={(key) => {
                      const val = key as string;
                      if (val) {
                        updateTunnel(tunnel.id, { baseDomain: val });
                      }
                    }}
                    className="flex-1 max-w-[140px]"
                  >
                    <Select.Trigger className="h-10 min-h-10 rounded-none border-none bg-transparent hover:bg-black/5 dark:hover:bg-white/5 data-[hover=true]:bg-black/5 dark:data-[hover=true]:bg-white/5 transition-all shadow-none px-2 flex items-center justify-between outline-none">
                      <Select.Value className="text-(--text-main) text-sm font-semibold text-left truncate" />
                      <Select.Indicator className="text-black/40 dark:text-white/40 ml-1" />
                    </Select.Trigger>
                    <Select.Popover className="bg-(--bg-surface) border border-(--glass-border-light) rounded-xl shadow-2xl p-1 min-w-[180px]">
                      <ListBox className="p-0">
                        {customDomains.map((d) => (
                          <ListBox.Item
                            key={d}
                            id={d}
                            textValue={d}
                            className="text-(--text-main) data-[hovered=true]:bg-indigo-50 data-[focused=true]:bg-indigo-50 dark:data-[hovered=true]:bg-white/5 dark:data-[focused=true]:bg-white/5 p-2 rounded-lg cursor-pointer outline-none transition-colors"
                          >
                            {d}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>
              )}

              {tunnel.domainType === "custom" && customDomains.length === 0 && (
                <button
                  onClick={() => router.push("/domains")}
                  className="flex-1 px-4 rounded-xl text-sm font-medium transition-all h-10 border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 whitespace-nowrap overflow-hidden text-ellipsis text-left flex items-center justify-between group"
                >
                  Setup Domain
                  <span className="ml-2 transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
            <button
              onClick={() => toggleTunnelStatus(tunnel.id)}
              className="flex items-center justify-center gap-2 px-6 h-10 rounded-xl text-sm font-bold transition-all w-full sm:w-auto bg-black/5 dark:bg-white/5 text-(--text-main) border border-black/15 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 hover:border-emerald-500/30"
            >
              <Play size={14} fill="currentColor" />
              Publish
            </button>

            <button
              onClick={() => removeTunnel(tunnel.id)}
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-all text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
