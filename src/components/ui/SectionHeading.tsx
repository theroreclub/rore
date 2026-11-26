import React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  title: string;
  description?: string;
  align?: "left" | "center" | "right";
}

export function SectionHeading({
  className,
  label,
  title,
  description,
  align = "center",
  ...props
}: SectionHeadingProps) {
  const alignmentStyles = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <div
      className={cn("flex flex-col space-y-3", alignmentStyles[align], className)}
      {...props}
    >
      {label && (
        <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-accent">
          {label}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight uppercase leading-[1.15]">
        {title}
      </h2>
      {description && (
        <p className="text-sm sm:text-base text-text-secondary font-sans max-w-2xl leading-relaxed mt-1">
          {description}
        </p>
      )}
    </div>
  );
}
