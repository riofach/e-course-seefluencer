import Link from "next/link";

import { Button } from "~/components/ui/button";

export function LandingPricingCTA() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-400">
        Start Learning Today
      </p>
      <h2 className="mt-4 font-[family-name:var(--font-playfair-display)] text-3xl font-bold sm:text-4xl">
        Unlock Your Full Creative Potential
      </h2>
      <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
        Subscribe to access all premium courses, quizzes, and progress tracking — cancel anytime.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button
          asChild
          className="min-h-[44px] rounded-full bg-indigo-600 px-8 py-3 text-base font-semibold text-white hover:bg-indigo-700"
        >
          <Link href="/pricing">View Pricing Plans</Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="min-h-[44px] rounded-full border-slate-300 px-8 text-base font-semibold text-slate-900 dark:border-[#2A2A3C] dark:bg-transparent dark:text-white"
        >
          <Link href="/courses">Start Browsing Free Courses</Link>
        </Button>
      </div>
    </div>
  );
}
