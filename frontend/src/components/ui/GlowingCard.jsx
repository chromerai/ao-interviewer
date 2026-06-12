import React from "react";
import { cn } from "../../lib/utils";

export function GlowingCard({ children, className, containerClassName }) {
  return (
    <div 
      className={cn(
        "relative group rounded-2xl p-[1px] bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 border border-white/5 transition-all duration-300 hover:border-zinc-700/80",
        containerClassName
      )}
    >
      {/* Background hover glowing gradient */}
      <div 
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" 
      />
      
      {/* Inner card content wrapper */}
      <div 
        className={cn(
          "relative z-10 glass-panel rounded-2xl p-6 h-full flex flex-col justify-start overflow-hidden",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
