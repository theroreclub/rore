"use client";

import { MotionConfig, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function MotionPolicy({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <MotionConfig reducedMotion="user" transition={{
      type: "tween", duration: reduce ? 0 : 0.24, ease: [0.22, 1, 0.36, 1],
    }}>
      {children}
    </MotionConfig>
  );
}
