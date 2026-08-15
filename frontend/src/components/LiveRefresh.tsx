"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Refresh the executive dashboard so it reflects the backend's live simulation ticks. */
export function LiveRefresh() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/") return;

    const interval = window.setInterval(() => {
      if (!document.hidden) {
        window.location.reload();
      }
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [pathname]);

  return null;
}
