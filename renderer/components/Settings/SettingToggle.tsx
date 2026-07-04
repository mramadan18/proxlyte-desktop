import { LucideIcon } from "lucide-react";

interface SettingToggleProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isEnabled: boolean;
  onToggle: () => void;
  isLast?: boolean;
}

export function SettingToggle({
  icon: Icon,
  title,
  description,
  isEnabled,
  onToggle,
  isLast = false,
}: SettingToggleProps) {
  return (
    <div
      className={`flex items-center justify-between py-4 ${
        !isLast ? "border-b border-(--glass-border-light)" : ""
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500
            ${
              isEnabled
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                : "bg-(--glass-bg) text-(--text-muted) border border-(--glass-border-light)"
            }
          `}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex flex-col gap-0.5">
          <h3 className="text-sm font-bold text-(--text-main) tracking-wide">
            {title}
          </h3>
          <p className="text-[11px] font-medium text-(--text-muted)/80">{description}</p>
        </div>
      </div>

      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-all duration-500 outline-none p-1 shrink-0 border
          ${
            isEnabled
              ? "bg-indigo-600 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
              : "bg-slate-300 dark:bg-white/10 border-black/15 dark:border-white/10"
          }
        `}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white transition-all duration-500 shadow-md transform
            ${isEnabled ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
}
