"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

import { Button } from "~/components/ui/button";

type PaywallTeaserOverlayProps = {
  children?: React.ReactNode;
};

export function PaywallTeaserOverlay({ children }: PaywallTeaserOverlayProps) {
  return (
    <div className="relative min-h-[400px] w-full overflow-hidden rounded-lg">
      {children && (
        <div className="pointer-events-none blur-sm select-none">
          {children}
        </div>
      )}
      <div className="from-muted/30 to-muted/80 absolute inset-0 bg-gradient-to-b backdrop-blur-md" />
      <div className="relative z-10 flex min-h-[400px] flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
          <Lock className="h-8 w-8 text-indigo-500" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">
            This lesson is for Pro members
          </h2>
          <p className="text-muted-foreground max-w-sm text-sm">
            Unlock this lesson and all premium content with a Pro subscription.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="mt-2 bg-indigo-600 hover:bg-indigo-700"
        >
          <Link href="/pricing">Upgrade to Pro</Link>
        </Button>
      </div>
    </div>
  );
}
