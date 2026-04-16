import Head from "next/head";
import { RadioGroup, Radio } from "@heroui/react";
import {
  ShieldCheck,
  AlertTriangle,
  Key,
  Eye,
  EyeOff,
  Server,
} from "lucide-react";
import { ExposureOption } from "../components/Network/ExposureOption";
import { DomainSettings } from "../components/Network/DomainSettings";
import { useNetworkStore } from "../store/networkStore";

export default function NetworkPage() {
  const {
    mode,
    setMode,
    authEnabled,
    toggleAuth,
    showPassword,
    toggleShowPassword,
    exposureModes,
  } = useNetworkStore();

  return (
    <div className="flex flex-col gap-6 pb-10">
      <Head>
        <title>Network Settings - Proxlyte</title>
      </Head>

      <div className="flex flex-col gap-1 sm:gap-1.5">
        <h1 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-br from-white to-white/60 tracking-tight">
          Network
        </h1>
        <p className="text-white/40 text-[12px] font-medium max-w-lg">
          Control how your services are exposed to the internet. Configure
          tunneling architecture and access controls.
        </p>
      </div>

      <div className="relative group rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl transition-all duration-500">
        <div className="relative bg-white/2 backdrop-blur-xl border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="px-5 py-5 sm:px-6 sm:py-5 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/1">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/3 border border-white/5 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-fuchsia-400" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Exposure Architecture
              </h2>
            </div>
            <div className="px-3 py-1 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 text-[9px] font-black text-fuchsia-400 uppercase tracking-widest shadow-inner">
              Layer 7 Routing Active
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <RadioGroup
              value={mode}
              onChange={setMode}
              className="flex flex-col gap-2.5 sm:gap-3 w-full"
            >
              {exposureModes.map((item) => {
                const isSelected = mode === item.id;
                return (
                  <Radio
                    key={item.id}
                    value={item.id}
                    className={`m-0 inline-flex items-center justify-between flex-row-reverse w-full max-w-full cursor-pointer rounded-xl sm:rounded-2xl p-3 sm:p-4 border transition-all duration-500 group
                      ${
                        isSelected
                          ? "bg-white/4 border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
                          : "bg-transparent border-transparent hover:bg-white/2 hover:border-white/5"
                      }
                    `}
                  >
                    <ExposureOption item={item} isSelected={isSelected} />
                  </Radio>
                );
              })}
            </RadioGroup>

            {mode === "custom-domain" && (
              <div className="mt-8 pt-8 border-t border-white/5 animate-in slide-in-from-top-4 fade-in duration-500">
                <DomainSettings />
              </div>
            )}

            {mode === "local" && (
              <div className="mt-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex gap-3 animate-in slide-in-from-top-4 fade-in duration-500">
                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5 text-left">
                  <h4 className="text-sm font-bold text-yellow-500">
                    Local Only Mode
                  </h4>
                  <p className="text-[12px] text-yellow-500/70 font-medium">
                    Your server is isolated. It will only accept connections
                    originating from the same machine. External access is
                    denied.
                  </p>
                </div>
              </div>
            )}

            {mode !== "local" && (
              <div className="mt-8 pt-8 border-t border-white/5 animate-in slide-in-from-top-4 fade-in duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                      <Key className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide">Access Control</h3>
                      <p className="text-[11px] font-medium text-white/40">Require Basic Authentication for external visitors</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={toggleAuth}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-300 outline-none
                        ${authEnabled ? 'bg-indigo-500' : 'bg-white/10'}
                      `}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm
                        ${authEnabled ? 'left-6' : 'left-1'}
                      `} />
                    </button>
                  </div>
                </div>

                {authEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Username</label>
                      <input 
                        type="text" 
                        placeholder="admin" 
                        className="w-full bg-black/20 border border-white/5 focus:border-indigo-500/50 rounded-xl text-white text-sm py-3 px-4 outline-none transition-colors"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Password</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          className="w-full bg-black/20 border border-white/5 focus:border-indigo-500/50 rounded-xl text-white text-sm py-3 px-4 outline-none transition-colors"
                        />
                        <button 
                          onClick={toggleShowPassword}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 px-2 mt-4 opacity-50 border-white/5">
        <Server className="w-4 h-4 text-white" />
        <p className="text-[10px] font-medium text-white uppercase tracking-[0.3em]">
          Hardware Acceleration Enabled
        </p>
      </div>
    </div>
  );
}
