import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function CustomNode({ data, selected }) {
  const isHub = data.category === 'hub';
  const isVariable = data.category === 'variable';
  const isCore = data.category === 'core';
  const isObjection = data.category === 'objection';
  const isRefutation = data.category === 'refutation';

  const isCircular = isHub || isVariable || isCore;
  
  let accentColor = "text-primary";
  let borderGradient = "from-border to-border";
  let bgOverlay = "bg-muted/5";

  if (isCore) {
    accentColor = "text-amber-500";
    borderGradient = "from-amber-500 via-orange-500 to-yellow-500";
    bgOverlay = "bg-amber-500/10";
  } else if (isHub) {
    accentColor = "text-blue-500";
    borderGradient = "from-blue-600 via-indigo-500 to-cyan-400";
    bgOverlay = "bg-blue-500/5";
  } else if (isVariable) {
    accentColor = "text-emerald-500";
    borderGradient = "from-emerald-500 to-teal-400";
    bgOverlay = "bg-emerald-500/5";
  } else if (isObjection) {
    accentColor = "text-red-500";
    borderGradient = "from-red-500 to-rose-400";
    bgOverlay = "bg-red-500/5";
  }

  return (
    <div
      className={cn(
        "group relative transition-all duration-500 cursor-pointer",
        isCircular ? "flex items-center justify-center" : "w-64",
        data.dimmed ? "opacity-10 grayscale blur-[1px] scale-90" : "opacity-100 scale-100"
      )}
    >
      {/* Animated Border Glow for Hubs */}
      {isCircular && !data.dimmed && (
        <div className={cn(
          "absolute inset-0 rounded-full blur-xl opacity-20 animate-pulse bg-gradient-to-tr",
          borderGradient
        )} />
      )}

      <div className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden transition-all duration-300",
        isCircular 
          ? cn("rounded-full border-2 bg-card/40 backdrop-blur-xl shadow-2xl", 
               isCore ? "w-56 h-56" : "w-40 h-40") 
          : "rounded-2xl border bg-card/60 backdrop-blur-lg shadow-sm w-full",
        selected ? "ring-2 ring-offset-4 ring-offset-background ring-primary border-transparent" : "border-border/50",
        data.dimmed ? "" : "hover:border-primary/50"
      )}>
        
        {/* Hub/Circular Content */}
        {isCircular ? (
          <div className="flex flex-col items-center text-center p-6">
            <span className={cn("text-xs uppercase font-black tracking-[0.2em] mb-2 opacity-50", accentColor)}>
              {data.category}
            </span>
            <span className={cn("text-lg font-bold leading-tight tracking-tight", isCore ? "text-2xl" : "text-base")}>
              {data.label}
            </span>
          </div>
        ) : (
          /* Card Content (Ideas) */
          <>
            <div className={cn("w-full px-4 py-2 border-b border-border/50 text-[10px] uppercase font-bold tracking-widest bg-muted/20", accentColor)}>
              {data.label}
            </div>
            <div className="p-4 text-xs text-muted-foreground leading-relaxed">
              {data.summary}
            </div>
          </>
        )}

        {/* Portals */}
        <Handle type="target" position={Position.Top} className="opacity-0" />
        <Handle type="source" position={Position.Bottom} className="opacity-0" />
      </div>
    </div>
  );
}
