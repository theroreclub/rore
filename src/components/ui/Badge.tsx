import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive" | "outline" | "gold";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "glass text-white border-white/20",
    secondary: "glass text-white/70 border-white/10",
    success: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 backdrop-blur-md",
    warning: "bg-amber-500/15 text-amber-400 border border-amber-500/30 backdrop-blur-md",
    destructive: "bg-rose-500/15 text-rose-400 border border-rose-400/30 backdrop-blur-md",
    outline: "glass border-white/30 text-white",
    gold: "bg-accent/15 text-accent border border-accent/40 backdrop-blur-md",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-medium tracking-[0.1em] uppercase border transition-colors duration-300",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
