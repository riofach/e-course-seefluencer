import Link from "next/link";

import { Button } from "~/components/ui/button";

const trustChips = ["Curated courses", "Practical lessons", "Premium experience"];

const microTrustPoints = [
  "Creator-led curriculum",
  "Focused lesson flow",
  "Built for completion",
];

const lessonHighlights = [
  {
    label: "Structured roadmap",
    value: "12 concise modules that move from inspiration to execution.",
  },
  {
    label: "Creator-backed credibility",
    value: "Lessons shaped by trusted voices with practical, real-world context.",
  },
  {
    label: "Momentum by design",
    value: "Clear chapter flow, progress cues, and premium pacing that keeps you finishing.",
  },
];

export function LandingHero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,_rgba(255,245,245,1)_0%,_rgba(255,255,255,0.98)_42%,_rgba(238,248,255,1)_100%)] px-6 py-12 dark:bg-[linear-gradient(135deg,_#151520_0%,_#12121A_45%,_#102228_100%)] sm:px-10 sm:py-14 lg:px-12 lg:py-12"
    >
      <div className="pointer-events-none absolute left-1/2 top-6 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(255,107,107,0.16),_rgba(155,89,182,0.08)_42%,_transparent_72%)] blur-3xl dark:bg-[radial-gradient(circle,_rgba(255,107,107,0.14),_rgba(155,89,182,0.08)_44%,_transparent_74%)]" />
      <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(26,188,156,0.20),_transparent_68%)] blur-2xl" />
      <div className="pointer-events-none absolute left-0 top-32 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(155,89,182,0.14),_transparent_70%)] blur-3xl dark:bg-[radial-gradient(circle,_rgba(155,89,182,0.18),_transparent_72%)]" />

      <div className="relative grid min-h-[31rem] content-start gap-8 pt-2 sm:min-h-[33rem] sm:pt-4 lg:min-h-[36rem] lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-start lg:gap-10 lg:pt-6">
        <div className="max-w-3xl space-y-5 lg:pt-4">
          <span className="inline-flex rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/10 dark:text-slate-200">
            Learn from trusted creators
          </span>

          <div className="space-y-3">
            <h1 className="font-[family-name:var(--font-playfair-display)] text-4xl font-bold tracking-tight text-balance text-slate-900 sm:text-5xl lg:text-6xl dark:text-white">
              Turn creator insight into structured lessons you can actually finish.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
              Discover premium learning paths from trusted creators—blending editorial polish,
              practical guidance, and a focused experience that helps you move from inspired to in
              progress.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <Button
              asChild
              className="min-h-[44px] rounded-full bg-indigo-600 px-8 py-3 text-base font-semibold text-white hover:bg-indigo-700"
            >
              <Link href="/courses">Explore Courses</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="min-h-[44px] rounded-full border-slate-300/80 bg-white/75 px-8 py-3 text-base font-semibold text-slate-800 shadow-sm hover:bg-white dark:border-[#2A2A3C] dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
            >
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 pt-1 text-sm text-slate-600 dark:text-slate-300">
            {trustChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 dark:border-white/10 dark:bg-white/5"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-sm text-slate-500 dark:text-slate-400">
            {microTrustPoints.map((point) => (
              <div key={point} className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,_#FF6B6B_0%,_#9B59B6_52%,_#1ABC9C_100%)]" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/50 bg-white/75 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur dark:border-[#2A2A3C] dark:bg-[#1A1A24] dark:shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Creator-led series
                </p>
                <h2 className="mt-2 font-[family-name:var(--font-playfair-display)] text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Learn like you&apos;re inside a premium studio session.
                </h2>
              </div>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-slate-900">
                New
              </span>
            </div>

            <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-5 dark:border-white/10 dark:bg-white/5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Creative Influence Masterclass
                  </p>
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                    A polished curriculum for creators who want more than motivation—clear lessons,
                    practical frameworks, and momentum built into every chapter.
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-900 px-3 py-2 text-right text-xs font-semibold text-white dark:bg-white dark:text-slate-900">
                  <span className="block">12 chapters</span>
                  <span className="mt-1 block text-[11px] opacity-80">4h 30m</span>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  <span>Typical learner momentum</span>
                  <span>82% completion</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-white/10">
                  <div className="h-2 w-[82%] rounded-full bg-[linear-gradient(90deg,_#FF6B6B_0%,_#9B59B6_52%,_#1ABC9C_100%)]" />
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {lessonHighlights.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
