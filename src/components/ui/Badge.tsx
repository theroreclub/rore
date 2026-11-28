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
    default: "glass text-shop-ink border-shop-rule",
    secondary: "glass text-shop-muted border-shop-rule",
    success: "bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 backdrop-blur-md",
    warning: "bg-amber-500/15 text-amber-900 border border-amber-500/30 backdrop-blur-md",
    destructive: "bg-rose-500/15 text-shop-wine border border-rose-400/30 backdrop-blur-md",
    outline: "glass border-shop-rule text-shop-ink",
    gold: "bg-accent/15 text-shop-wine border border-accent/40 backdrop-blur-md",
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
