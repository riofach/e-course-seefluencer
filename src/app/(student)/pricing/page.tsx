import type { Metadata } from "next";

import { PricingPageClient } from "~/components/student/pricing-page-client";
import { getServerAuthSession } from "~/server/auth";
import { getPlans } from "~/server/queries/plans";
import { getUserActiveSubscription } from "~/server/queries/subscriptions";

export const metadata: Metadata = {
  title: "Pricing | Seefluencer",
  description:
    "Explore Seefluencer premium plans, compare value, and continue to checkout only when you are ready.",
};

const fallbackPlans = [
  {
    id: -1,
    name: "Pro Monthly",
    price: 149000,
    durationDays: 30,
    createdAt: null,
  },
  {
    id: -2,
    name: "Creator Sprint",
    price: 399000,
    durationDays: 90,
    createdAt: null,
  },
  {
    id: -3,
    name: "Studio Access",
    price: 699000,
    durationDays: 180,
    createdAt: null,
  },
] satisfies Awaited<ReturnType<typeof getPlans>>;

export default async function PricingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  type PricingSearchParams = {
    plan?: string | string[];
  };

  const [session, plans, resolvedSearchParams] = await Promise.all([
    getServerAuthSession(),
    getPlans(),
    (searchParams ?? Promise.resolve({})) as Promise<PricingSearchParams>,
  ]);

  const isAuthenticated = !!session?.user?.id;
  const activeSubscription = isAuthenticated
    ? await getUserActiveSubscription(session.user.id)
    : null;
  const planParam = resolvedSearchParams.plan;
  const highlightedPlanId = Number.parseInt(
    Array.isArray(planParam) ? (planParam[0] ?? "") : (planParam ?? ""),
    10,
  );

  const safePlans = plans.length > 0 ? plans : fallbackPlans;

  return (
    <div>
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-14 px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8 lg:gap-18 lg:px-8 lg:pb-24">
        <div className="relative isolate overflow-hidden rounded-[32px] border border-slate-200/80 bg-[linear-gradient(135deg,_#FFF8F7_0%,_#F7F4FF_45%,_#EEFDFC_100%)] px-6 py-10 text-slate-900 shadow-[0_28px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[linear-gradient(135deg,_#151520_0%,_#12121A_45%,_#102228_100%)] dark:text-slate-50 dark:shadow-none sm:px-10 sm:py-12 lg:px-12 lg:py-14">
          <div aria-hidden="true">
            <div className="pointer-events-none absolute left-1/2 top-4 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(255,107,107,0.22),_rgba(155,89,182,0.12)_42%,_transparent_72%)] blur-3xl" />
            <div className="pointer-events-none absolute -right-16 top-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(26,188,156,0.24),_transparent_68%)] blur-3xl" />
            <div className="pointer-events-none absolute left-0 top-28 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(155,89,182,0.16),_transparent_72%)] blur-3xl" />
          </div>

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-start">
            <div className="max-w-3xl space-y-6">
              <span className="inline-flex rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                Premium access, public clarity
              </span>

              <div className="space-y-4">
                <h1 className="font-[family-name:var(--font-playfair-display)] text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                  Pricing that feels like momentum, not friction.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
                  Compare plans, understand the value, and decide on your own timeline.
                  You only need to sign in when you are ready to complete checkout.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
                {[
                  "Cancel anytime",
                  "Premium lessons + quizzes",
                  "Creator-led structured paths",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-slate-200/80 bg-white/75 px-4 py-2 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200/80 pt-4 text-sm text-slate-600 dark:border-white/10 dark:text-slate-300">
                {[
                  "Transparent pricing",
                  "Access activates after payment",
                  "Guest-friendly evaluation flow",
                ].map((point) => (
                  <div key={point} className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,_#FF6B6B_0%,_#9B59B6_52%,_#1ABC9C_100%)]" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200/80 bg-white/85 p-6 text-slate-900 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-sm dark:border-[#2A2A3C] dark:bg-[#1A1A24] dark:text-slate-50 dark:shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Why learners upgrade
                </p>
                <h2 className="font-[family-name:var(--font-playfair-display)] text-3xl font-bold tracking-tight">
                  Keep the spark, remove the stop signs.
                </h2>
                <div className="space-y-3">
                  {[
                    "Unlock every premium lesson without teaser interruptions.",
                    "Learn with quizzes, progress feedback, and creator-led pacing.",
                    "Start from pricing as a guest, then authenticate only for checkout.",
                  ].map((bullet) => (
                    <div
                      key={bullet}
                      className="rounded-2xl border border-slate-200/80 bg-slate-50/90 px-4 py-3 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                    >
                      {bullet}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <PricingPageClient
          plans={safePlans}
          isAuthenticated={isAuthenticated}
          isSubscribed={activeSubscription !== null}
          activePlanId={activeSubscription?.planId ?? null}
          highlightedPlanId={Number.isNaN(highlightedPlanId) ? null : highlightedPlanId}
        />

        <section
          aria-labelledby="pricing-trust-section"
          className="grid gap-6 rounded-[32px] border border-slate-200/80 bg-white/80 p-6 text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-[#2A2A3C] dark:bg-[#1A1A24] dark:text-slate-50 dark:shadow-none sm:p-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8 lg:p-10"
        >
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-300">
              Trust & conversion layer
            </p>
            <h2
              id="pricing-trust-section"
              className="font-[family-name:var(--font-playfair-display)] text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Built to earn confidence before asking for commitment.
            </h2>
            <p className="max-w-xl text-base leading-7 text-slate-600 dark:text-slate-300">
              The premium path is designed to feel clear, trustworthy, and reversible.
              Browse first, buy when ready, and keep your plan context after sign-in.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { value: "Cancel anytime", label: "No forced long-term lock-in" },
                { value: "Premium quizzes", label: "Structured reinforcement after lessons" },
                { value: "Return to pricing", label: "Callback keeps context after auth" },
              ].map((item) => (
                <div
                  key={item.value}
                  className="rounded-[24px] border border-slate-200/80 bg-slate-50/90 p-4 dark:border-[#2A2A3C] dark:bg-[#14141C]"
                >
                  <p className="font-[family-name:var(--font-playfair-display)] text-2xl font-bold text-slate-900 dark:text-white">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,_rgba(255,255,255,0.92)_0%,_rgba(248,250,252,0.96)_100%)] p-5 shadow-[0_20px_55px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[linear-gradient(180deg,_rgba(255,255,255,0.05)_0%,_rgba(255,255,255,0.02)_100%)] dark:shadow-none sm:p-6">
            <h3 className="font-[family-name:var(--font-playfair-display)] text-2xl font-bold tracking-tight">
              Quick answers before checkout
            </h3>
            <div className="space-y-3">
              {[
                {
                  question: "Do I need an account to view pricing?",
                  answer:
                    "No. Pricing is public so you can compare plans first. An account is only required when you initiate checkout.",
                },
                {
                  question: "What happens if I click subscribe while logged out?",
                  answer:
                    "You are sent to login with a callback back to /pricing, so you can continue without losing plan context.",
                },
                {
                  question: "Does checkout still use Midtrans?",
                  answer:
                    "Yes. Authenticated purchases continue to use the existing Midtrans Snap.js checkout flow without changing webhook behavior.",
                },
              ].map((item) => (
                <div
                  key={item.question}
                  className="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 dark:border-white/10 dark:bg-[#14141C]"
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.question}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
