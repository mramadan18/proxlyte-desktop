import { LucideIcon } from "lucide-react";

interface ExposureOptionProps {
  item: {
    id: string;
    icon: LucideIcon;
    title: string;
    desc: string;
    color: string;
  };
  isSelected: boolean;
}

export const ExposureOption = ({ item, isSelected }: ExposureOptionProps) => {
  const Icon = item.icon;
  return (
    <div className="flex items-center gap-3 sm:gap-4 w-full py-1">
      <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center border transition-all duration-500 relative shrink-0
        ${isSelected 
          ? 'bg-linear-to-br from-indigo-500 to-fuchsia-500 text-white border-transparent shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
          : 'bg-black/40 text-white/40 border-white/5 group-hover:border-white/10 group-hover:text-white/60 group-hover:bg-black/60'}
      `}>
        {isSelected && (
          <div className="absolute inset-0 bg-indigo-500/30 blur-md rounded-lg sm:rounded-xl -z-10"></div>
        )}
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 z-10" />
      </div>
      <div className="flex flex-col gap-0.5 text-left flex-1 min-w-0 pr-1">
        <span className={`text-[13px] sm:text-[14px] font-bold tracking-tight transition-colors duration-300 truncate ${isSelected ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
          {item.title}
        </span>
        <span className="text-[10px] sm:text-[11px] font-medium text-white/30 leading-tight line-clamp-2 md:line-clamp-none">
          {item.desc}
        </span>
      </div>
      
      {/* Visual Indicator for selection */}
      <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-500 shrink-0
        ${isSelected ? 'border-fuchsia-400 opacity-100 scale-100' : 'border-white/10 opacity-50 scale-95 group-hover:border-white/30'}
      `}>
         {isSelected && <div className="w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(217,70,239,1)]"></div>}
      </div>
    </div>
  );
};
