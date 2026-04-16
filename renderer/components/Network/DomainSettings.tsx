import { Input, Button } from "@heroui/react";
import { ArrowRight, Link as LinkIcon, CheckCircle2 } from "lucide-react";

export const DomainSettings = () => (
  <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-black/40 border border-white/5 shadow-inner relative overflow-hidden group">
    {/* Subtle animated border behind */}
    <div className="absolute inset-0 bg-linear-to-r from-fuchsia-500/0 via-fuchsia-500/5 to-fuchsia-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10"></div>
    
    <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
      <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center shadow-[0_0_15px_rgba(217,70,239,0.3)]">
        <LinkIcon className="w-3.5 h-3.5" />
      </div>
      <div>
        <h3 className="text-[13px] sm:text-[14px] font-bold text-white tracking-wide transition-all">Domain Uplink</h3>
        <p className="text-[10px] sm:text-[11px] text-white/40 mt-0.5">Attach a custom hostname to your tunnel</p>
      </div>
    </div>
    
    <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-end">
      <div className="flex-1 w-full flex flex-col gap-1.5 sm:gap-2">
        <label className="text-[9px] sm:text-[10px] font-bold text-white/40 uppercase tracking-widest px-1">Hostname Binding</label>
        <div className="relative">
          <Input 
            placeholder="api.proxlyte.dev"
            className="w-full h-10 sm:h-11 rounded-lg sm:rounded-xl border border-white/10 bg-white/2 text-white font-mono text-[12px] sm:text-[13px] transition-all focus:border-fuchsia-500/50 focus:bg-white/4 px-3.5 sm:px-4 pl-9 sm:pl-10 shadow-inner outline-none"
          />
          <div className="absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2 text-white/20">
            <GlobeIcon className="w-4 h-4" />
          </div>
        </div>
      </div>
      <Button 
        className="w-full md:w-auto bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-400 border border-fuchsia-500/30 font-bold h-10 sm:h-11 px-6 rounded-lg sm:rounded-xl transition-all shadow-[0_0_15px_rgba(217,70,239,0.2)] group/btn text-[12px] sm:text-[13px]"
      >
        <div className="flex items-center gap-1.5">
          <span className="tracking-wide text-xs">Link Node</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
        </div>
      </Button>
    </div>
    
    <div className="mt-6 flex items-center gap-2 text-[11px] text-white/30 font-medium px-1">
      <CheckCircle2 className="w-3.5 h-3.5 text-green-400/70" />
      <span>Automated SSL/TLS certificate provisioning included.</span>
    </div>
  </div>
);

// Extract icon since we don't have Globe imported here directly
const GlobeIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
)
