"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import type { ReactNode } from "react";

export function StorefrontOnly({ children }: { children: ReactNode }) {
  return useSelectedLayoutSegment() === "admin" ? null : children;
}
