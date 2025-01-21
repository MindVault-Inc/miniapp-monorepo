"use client";

import { ReactNode, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // @ts-expect-error - MiniKit.install accepts config object but types are incorrect
    MiniKit.install({
      styleIsolation: true,
      enableTelemetry: false,
      appId: process.env.NEXT_PUBLIC_WLD_APP_ID
    });
  }, []);

  return (
    <div className="relative isolate">
      {children}
    </div>
  );
} 