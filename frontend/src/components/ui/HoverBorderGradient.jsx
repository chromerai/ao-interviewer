import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Component = "button",
  duration = 1.5,
  clockwise = true,
  disabled = false,
  ...props
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Component
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => !disabled && setHovered(false)}
      disabled={disabled}
      className={cn(
        "relative flex rounded-xl content-center transition-all duration-300 items-center justify-center p-[1px] overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed",
        disabled ? "bg-zinc-800 border border-zinc-700/50" : "bg-zinc-800/50 border border-white/10 hover:border-transparent",
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          "w-full text-zinc-100 z-10 px-6 py-3 rounded-[11px] font-medium transition-colors duration-300",
          disabled ? "bg-zinc-900/40 text-zinc-500" : "bg-zinc-950/90 group-hover:bg-zinc-950/40",
          className
        )}
      >
        {children}
      </div>
      {!disabled && (
        <motion.div
          className="absolute inset-0 z-0 bg-[conic-gradient(from_0deg,transparent_40%,#6366f1_70%,#a855f7_90%,transparent_100%)]"
          initial={{ rotate: 0 }}
          animate={
            hovered
              ? { rotate: clockwise ? 360 : -360 }
              : { rotate: 0 }
          }
          transition={{
            duration: duration,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            width: "300%",
            height: "300%",
            left: "-100%",
            top: "-100%",
          }}
        />
      )}
    </Component>
  );
}
