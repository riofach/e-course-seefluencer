import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import { LandingHero } from "~/components/shared/landing-hero";
import { PublicNavbar } from "~/components/shared/public-navbar";

export const metadata: Metadata = {
  title: "Seefluencer | Learn from Influencers",
  description:
    "Discover curated online courses from trusted influencers with a polished learning experience built for modern creators.",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "900"],
  variable: "--font-playfair-display",
});

export default async function Home() {
  return (
    <div
      className={`${inter.variable} ${playfairDisplay.variable} min-h-screen bg-white font-[family-name:var(--font-inter)] tracking-[-0.02em] text-slate-900 dark:bg-[#0F0F14] dark:text-white`}
    >
      <PublicNavbar />

      <div id="main-content" className="mx-auto flex w-full max-w-7xl flex-col px-4 pt-2 sm:px-6 sm:pt-3 lg:px-8">
        <LandingHero />

        <section id="value" className="min-h-[24rem] border-b border-slate-200/70 py-16 dark:border-white/10">
          <div className="rounded-[28px] border border-dashed border-slate-300/80 p-8 dark:border-white/15">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Value proposition placeholder
            </p>
          </div>
        </section>

        <section id="highlights" className="min-h-[24rem] border-b border-slate-200/70 py-16 dark:border-white/10">
          <div className="rounded-[28px] border border-dashed border-slate-300/80 p-8 dark:border-white/15">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Featured highlights placeholder
            </p>
          </div>
        </section>

        <section id="trust" className="min-h-[24rem] border-b border-slate-200/70 py-16 dark:border-white/10">
          <div className="rounded-[28px] border border-dashed border-slate-300/80 p-8 dark:border-white/15">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Social proof placeholder
            </p>
          </div>
        </section>

        <section id="pricing-cta" className="min-h-[20rem] border-b border-slate-200/70 py-16 dark:border-white/10">
          <div className="rounded-[28px] border border-dashed border-slate-300/80 p-8 dark:border-white/15">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Pricing bridge placeholder
            </p>
          </div>
        </section>

        <footer id="footer" className="py-12">
          <div className="rounded-[28px] border border-dashed border-slate-300/80 p-8 dark:border-white/15">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Footer placeholder
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
