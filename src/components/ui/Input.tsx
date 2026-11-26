import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, hint, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] font-sans font-medium uppercase tracking-[0.1em] text-white/80"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            type={type}
            ref={ref}
            className={cn(
              "w-full h-11 px-4 py-2.5 glass text-white placeholder:text-white/40 text-xs font-sans rounded-xl border border-white/15 transition-all duration-300 ease-in-out focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-40",
              error && "border-rose-400 focus:border-rose-400 focus:ring-rose-400",
              className
            )}
            {...props}
          />
        </div>
        {hint && !error && (
          <p className="text-[11px] text-white/60 font-sans tracking-wide">{hint}</p>
        )}
        {error && (
          <p className="text-[11px] text-rose-400 font-sans tracking-wide">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
