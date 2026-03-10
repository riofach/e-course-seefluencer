"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { shouldUsePublicNavbar } from "./public-navbar-routes";

export function GlobalHeader({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || shouldUsePublicNavbar(pathname)) return null;

  return (
    <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
      <div className="container flex h-14 items-center justify-end px-4">
        {children}
      </div>
    </header>
  );
}
