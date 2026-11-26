import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "link";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center uppercase font-sans text-xs tracking-[0.1em] rounded-full transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-white text-black hover:bg-zinc-200 active:translate-y-[1px] font-bold shadow-lg shadow-white/5",
      secondary:
        "glass border border-white/20 text-white hover:bg-white/10 hover:border-white/40 active:translate-y-[1px]",
      outline:
        "glass border border-white/20 text-white hover:bg-white/10 hover:border-white/40 active:translate-y-[1px]",
      link:
        "bg-transparent text-white underline underline-offset-4 hover:opacity-70 p-0 h-auto tracking-[0.1em]",
    };

    const sizeStyles = {
      sm: variant === "link" ? "" : "h-9 px-4 py-2",
      md: variant === "link" ? "" : "h-11 px-6 py-2.5",
      lg: variant === "link" ? "" : "h-13 px-8 py-3.5 text-[13px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
