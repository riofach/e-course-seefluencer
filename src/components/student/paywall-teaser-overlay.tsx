import Link from "next/link";
import { Lock } from "lucide-react";

import { Button } from "~/components/ui/button";

type PaywallTeaserOverlayProps = {
  children: React.ReactNode;
};

export function PaywallTeaserOverlay({ children }: PaywallTeaserOverlayProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="pointer-events-none select-none blur-sm">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-white/10 bg-background/95 px-6 py-8 text-center shadow-xl">
          <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
            <Lock className="size-5" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">This lesson is for Premium members</h2>
            <p className="text-muted-foreground text-sm leading-6">
              Upgrade paket belajar Anda untuk membuka lesson ini dan seluruh
              materi premium lainnya.
            </p>
          </div>
          <Button asChild className="min-h-[44px] w-full sm:w-auto">
            <Link href="/pricing">Lihat paket premium</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
