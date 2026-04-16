import { ReactNode } from "react";
import { TitleBar } from "./TitleBar";
import { Sidebar } from "./Sidebar";
import { DynamicBackground } from "./DynamicBackground";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen w-screen bg-(--bg-main) text-(--text-main) overflow-hidden text-xs sm:text-sm selection:bg-indigo-500/30 font-sans relative">
      <TitleBar />
      <DynamicBackground />

      <div className="relative z-10 flex flex-col md:flex-row w-full flex-1 p-2 gap-2 overflow-hidden">
        <Sidebar />
        {/* Main Content Area */}
        <main className="flex-1 bg-white/1 backdrop-blur-3xl border border-white/5 rounded-xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl relative transition-all duration-500">
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
            <div className="container mx-auto animate-in fade-in zoom-in-95 duration-500 pb-12">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
