import { Inter, Playfair_Display } from "next/font/google";
import type { ReactNode } from "react";

import { PublicNavbar } from "~/components/shared/public-navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-playfair-display",
});

type PublicNavbarShellProps = {
  children: ReactNode;
};

export function PublicNavbarShell({ children }: PublicNavbarShellProps) {
  return (
    <div
      className={`${inter.variable} ${playfairDisplay.variable} flex min-h-screen flex-col bg-white font-[family-name:var(--font-inter)] tracking-[-0.02em] text-slate-900 dark:bg-[#0F0F14] dark:text-white`}
    >
      <PublicNavbar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
