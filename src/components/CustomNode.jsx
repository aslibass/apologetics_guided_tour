import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function CustomNode({ data, selected }) {
  const isObjection = data.category === 'objection';
  const isRefutation = data.category === 'refutation';
  const isCore = data.category === 'core';
  
  let borderClass = "border-border";
  if (isObjection) borderClass = "border-red-500/50";
  if (isRefutation) borderClass = "border-emerald-500/50";
  if (isCore) borderClass = "border-amber-500/50";

  let ringClass = "ring-2 ring-primary shadow-lg";
  if (isObjection) ringClass = "ring-2 ring-red-500 shadow-red-500/20";
  if (isRefutation) ringClass = "ring-2 ring-emerald-500 shadow-emerald-500/20";
  if (isCore) ringClass = "ring-2 ring-amber-500 shadow-amber-500/20";

  let headerClass = "bg-muted/50 border-border";
  if (isObjection) headerClass = "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
  if (isRefutation) headerClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  if (isCore) headerClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";

  return (
    <div
      className={cn(
        "relative rounded-xl border bg-card text-card-foreground shadow-sm w-64 transition-all duration-300 cursor-pointer overflow-hidden",
        borderClass,
        selected ? ringClass : "",
        "hover:shadow-md",
        selected ? "-translate-y-1" : "",
        data.dimmed ? "opacity-30 grayscale-[50%]" : "opacity-100"
      )}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-muted-foreground" />
      
      <div className={cn(
        "px-4 py-2 border-b text-sm font-semibold flex items-center justify-between",
        headerClass
      )}>
        <span>{data.label}</span>
      </div>
      
      <div className="p-4 text-sm text-muted-foreground">
        {data.summary}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-muted-foreground" />
    </div>
  );
}
