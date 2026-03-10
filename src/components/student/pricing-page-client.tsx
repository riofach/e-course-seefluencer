"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, PackageOpen, Sparkles } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { formatIDR } from "~/lib/format-currency";
import { cn } from "~/lib/utils";
import { initiateMidtransCheckout } from "~/server/actions/payments/initiate-checkout";
import type { Plan } from "~/server/queries/plans";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

type PricingPageClientProps = {
  plans: Plan[];
  isSubscribed: boolean;
};

function formatDuration(days: number) {
  if (days === 30) {
    return "30 hari akses penuh";
  }

  return `${days} hari akses penuh`;
}

export function PricingPageClient({
  plans,
  isSubscribed,
}: PricingPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingPlanId, setPendingPlanId] = useState<number | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    let interval: number;
    let timeout: number;

    if (isPolling) {
      if (isSubscribed) {
        setIsPolling(false);
      } else {
        interval = window.setInterval(() => {
          router.refresh();
        }, 2000);

        timeout = window.setTimeout(() => {
          setIsPolling(false);
        }, 10000);
      }
    }

    return () => {
      if (interval) window.clearInterval(interval);
      if (timeout) window.clearTimeout(timeout);
    };
  }, [isPolling, isSubscribed, router]);

  const handleCheckout = (planId: number) => {
    startTransition(async () => {
      setPendingPlanId(planId);

      const result = await initiateMidtransCheckout(planId);

      if (!result.success) {
        toast.error(result.error);
        setPendingPlanId(null);
        return;
      }

      if (typeof window === "undefined" || !window.snap) {
        toast.error("Midtrans Snap belum siap. Coba muat ulang halaman.");
        setPendingPlanId(null);
        return;
      }

      window.snap.pay(result.data.snap_token, {
        onClose: () => {
          setPendingPlanId(null);
        },
        onError: () => {
          toast.error("Pembayaran gagal diproses.");
          setPendingPlanId(null);
        },
        onPending: () => {
          toast("Pembayaran sedang diproses...");
          setPendingPlanId(null);
        },
        onSuccess: () => {
          toast.success(
            "Pembayaran berhasil! Sedang mengaktifkan langgananmu…",
          );
          setPendingPlanId(null);
          setIsPolling(true);
          router.refresh();
        },
      });
    });
  };

  if (plans.length === 0) {
    return (
      <Card className="border-dashed text-center">
        <CardHeader className="items-center text-center">
          <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
            <PackageOpen className="text-muted-foreground size-8" />
          </div>
          <CardTitle>No plans available yet</CardTitle>
          <CardDescription>
            Paket langganan belum tersedia. Sementara itu, kamu masih bisa
            lanjut eksplor kursus gratis.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link href="/courses">Lihat kursus</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {isSubscribed ? (
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-5 text-white shadow-[0_18px_45px_rgba(99,102,241,0.28)]">
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-white/10 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
              <Sparkles className="size-5" />
            </div>
            <div className="space-y-1.5">
              <p className="text-base font-semibold tracking-tight">
                You&apos;re Pro! ✨
              </p>
              <p className="max-w-2xl text-sm leading-6 text-white/85">
                Langgananmu aktif. Nikmati semua materi premium tanpa batas.
              </p>
              <p className="text-xs font-medium tracking-wide text-white/70 uppercase">
                Premium access unlocked
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const isLoading = isPending && pendingPlanId === plan.id;
          const isCurrentPlan = isSubscribed;

          return (
            <Card
              key={plan.id}
              className={cn(
                "justify-between rounded-3xl border shadow-sm transition-all duration-200",
                isCurrentPlan &&
                  "via-background to-background border-indigo-400/50 bg-gradient-to-b from-indigo-500/10 shadow-[0_0_0_1px_rgba(99,102,241,0.18),0_20px_50px_rgba(99,102,241,0.12)]",
              )}
            >
              <CardHeader className="space-y-4 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    {isCurrentPlan ? (
                      <p className="text-muted-foreground text-sm leading-6">
                        Paketmu aktif dan siap dipakai untuk akses semua lesson
                        premium.
                      </p>
                    ) : null}
                  </div>
                  {isCurrentPlan ? (
                    <Badge className="border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-emerald-300">
                      Active Plan
                    </Badge>
                  ) : null}
                </div>
                <CardDescription className="leading-7">
                  Paket premium untuk akses materi berbayar dan pengalaman
                  belajar penuh.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="space-y-1">
                  <p className="text-3xl font-semibold tracking-tight">
                    {formatIDR(plan.price)}
                  </p>
                  <p className="text-muted-foreground text-sm font-medium">
                    / bulan
                  </p>
                </div>

                <div className="space-y-3 rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="text-foreground text-sm font-medium">
                    {formatDuration(plan.durationDays)}
                  </p>
                  <ul className="text-muted-foreground space-y-2 text-sm leading-6">
                    <li>• Akses penuh ke semua lesson premium</li>
                    <li>• Pengalaman belajar tanpa paywall teaser</li>
                    <li>• Siap dipakai langsung setelah subscription aktif</li>
                  </ul>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  type="button"
                  className={cn(
                    "w-full gap-2 rounded-xl",
                    isCurrentPlan
                      ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10"
                      : "bg-indigo-600 hover:bg-indigo-700",
                  )}
                  onClick={() => handleCheckout(plan.id)}
                  disabled={isCurrentPlan || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : isCurrentPlan ? (
                    <span>Current Plan Active</span>
                  ) : (
                    <span>Subscribe</span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
