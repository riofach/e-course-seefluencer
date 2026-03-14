"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, PackageOpen, Sparkles } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import { formatIDR } from "~/lib/format-currency";
import { cn } from "~/lib/utils";
import { initiateMidtransCheckout } from "~/server/actions/payments/initiate-checkout";
import type { Plan } from "~/server/queries/plans";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

type PricingPageClientProps = {
  plans: Plan[];
  isAuthenticated: boolean;
  isSubscribed: boolean;
  activePlanId?: number | null;
  highlightedPlanId?: number | null;
};

function formatDuration(days: number) {
  if (days === 30) return "30 hari akses penuh";
  if (days === 90) return "90 hari untuk sprint pembelajaran intensif";
  if (days === 180) return "180 hari untuk momentum jangka panjang";
  return `${days} hari akses penuh`;
}

function getPlanBenefits(plan: Plan) {
  return [
    `Akses premium selama ${plan.durationDays} hari`,
    "Semua lesson premium dan quiz reinforcement terbuka",
    "Alur belajar tetap rapi dengan progress tracking existing",
  ];
}

export function PricingPageClient({
  plans,
  isAuthenticated,
  isSubscribed,
  activePlanId = null,
  highlightedPlanId = null,
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
          toast.success("Pembayaran berhasil! Sedang mengaktifkan langgananmu…");
          setPendingPlanId(null);
          setIsPolling(true);
          router.refresh();
        },
      });
    });
  };

  if (plans.length === 0) {
    return (
      <Card className="border-slate-200 bg-white text-center text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.08)] dark:border-[#2A2A3C] dark:bg-[#1A1A24] dark:text-white dark:shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
        <CardHeader className="items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-white/5">
            <PackageOpen className="size-8 text-slate-500 dark:text-slate-400" />
          </div>
          <CardTitle>No plans available yet</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-300">
            Paket langganan belum tersedia. Sementara itu, kamu masih bisa lanjut eksplor kursus gratis.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button asChild className="min-h-[44px] rounded-full bg-[#6366F1] hover:bg-[#8B5CF6]">
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
              <p className="text-base font-semibold tracking-tight">You&apos;re Pro! ✨</p>
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => {
          const isLoading = isPending && pendingPlanId === plan.id;
          const isCurrentPlan = activePlanId === plan.id;
          const isPlanDisabled = isSubscribed || isLoading;
          const isHighlighted = highlightedPlanId === plan.id;
          const unauthenticatedHref = `/login?callbackUrl=${encodeURIComponent(`/pricing?plan=${plan.id}`)}`;
          const benefits = getPlanBenefits(plan);

          return (
            <Card
              key={plan.id}
              className={cn(
                "flex rounded-[28px] border border-slate-200 bg-white text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-all duration-200 dark:border-[#2A2A3C] dark:bg-[#1A1A24] dark:text-white dark:shadow-[0_18px_40px_rgba(0,0,0,0.24)]",
                isHighlighted &&
                  "shadow-[0_0_0_1px_rgba(99,102,241,0.45),0_24px_55px_rgba(99,102,241,0.18)]",
                isCurrentPlan &&
                  "shadow-[0_0_0_1px_rgba(99,102,241,0.4),0_20px_50px_rgba(99,102,241,0.14)]",
              )}
            >
              <CardHeader className="space-y-4 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="font-[family-name:var(--font-playfair-display)] text-3xl font-bold tracking-tight">
                        {plan.name}
                      </CardTitle>
                      {isHighlighted ? (
                        <Badge className="border border-indigo-400/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-200">
                          Recommended
                        </Badge>
                      ) : null}
                    </div>
                    {isCurrentPlan ? (
                      <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Paketmu aktif dan siap dipakai untuk akses semua lesson premium.
                      </p>
                    ) : null}
                  </div>
                  {isCurrentPlan ? (
                     <Badge className="border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300">
                       Active Plan
                     </Badge>
                  ) : null}
                </div>
                <CardDescription className="text-sm leading-7 tracking-[-0.02em] text-slate-600 dark:text-slate-300">
                  Premium access for focused learners who want structure, momentum, and a polished creator-led experience.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="space-y-1">
                  <p className="font-[family-name:var(--font-playfair-display)] text-5xl font-bold tracking-tight text-slate-950 dark:text-white">
                    {formatIDR(plan.price)}
                  </p>
                  <p className="text-sm font-medium tracking-[-0.02em] text-slate-500 dark:text-slate-400">
                    / plan • {formatDuration(plan.durationDays)}
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 dark:border-[#2A2A3C] dark:bg-[#14141C]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    What you get
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 tracking-[-0.02em] text-slate-600 dark:text-slate-300">
                    {benefits.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="mt-auto flex-col items-stretch gap-3">
                {isAuthenticated ? (
                  <Button
                    type="button"
                    className={cn(
                      "min-h-[44px] w-full gap-2 rounded-full",
                      isCurrentPlan
                        ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/10"
                        : "bg-[#6366F1] text-white hover:bg-[#8B5CF6]",
                    )}
                    onClick={() => handleCheckout(plan.id)}
                    disabled={isPlanDisabled}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : isCurrentPlan ? (
                      <span>Current Plan Active</span>
                    ) : (
                      <>
                        <span>Subscribe with Midtrans</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="min-h-[44px] w-full rounded-full bg-[#6366F1] text-white hover:bg-[#8B5CF6]"
                  >
                    <Link href={unauthenticatedHref}>Login to Subscribe</Link>
                  </Button>
                )}

                {!isAuthenticated ? (
                  <p className="text-center text-xs leading-5 tracking-[-0.02em] text-slate-500 dark:text-slate-400">
                    Auth is only required to complete checkout. After login, you&apos;ll return here with this plan context.
                  </p>
                ) : null}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
