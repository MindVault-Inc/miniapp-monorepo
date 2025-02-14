"use client";

import eruda from "eruda";
import type * as React from "react";
import { useEffect } from "react";

interface ErudaProps {
  children: React.ReactNode;
}

export function Eruda({ children }: ErudaProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === "true") {
      try {
        eruda.init();
      } catch {
        // Silently fail if Eruda initialization fails
      }
    }
  }, []);

  return <>{children}</>;
}
