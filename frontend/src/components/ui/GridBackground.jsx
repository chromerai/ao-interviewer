import React from "react";

export function GridBackground({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#030303] relative flex flex-col items-center justify-start antialiased overflow-x-hidden">
      {/* Background Grid Lines */}
      <div 
        className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#16161d_1px,transparent_1px),linear-gradient(to_bottom,#16161d_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_50%,transparent_100%)] opacity-70"
      />
      
      {/* Radial soft background ambient glow */}
      <div className="absolute top-[-10%] left-[20%] w-[60%] h-[40%] rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[10%] w-[50%] h-[55%] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none z-0" />

      <div className="relative z-10 w-full flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
