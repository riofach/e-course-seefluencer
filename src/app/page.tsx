import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Playfair_Display } from "next/font/google";

import { HeroParallaxAccent } from "~/components/shared/hero-parallax-accent";
import { LandingHero } from "~/components/shared/landing-hero";
import { LandingHighlightsSection } from "~/components/shared/landing-highlights-section";
import { LandingPricingCTA } from "~/components/shared/landing-pricing-cta";
import { ScrollReveal } from "~/components/shared/scroll-reveal";
import { LandingTrustSection } from "~/components/shared/landing-trust-section";
import { LandingValueSection } from "~/components/shared/landing-value-section";
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
        <div className="relative isolate overflow-hidden rounded-[2rem]">
          <HeroParallaxAccent />
          <LandingHero />
        </div>

        <ScrollReveal>
          <section id="value" className="border-b border-slate-200/70 py-16 dark:border-white/10">
            <LandingValueSection />
          </section>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <section id="highlights" className="border-b border-slate-200/70 py-16 dark:border-white/10">
            <LandingHighlightsSection />
          </section>
        </ScrollReveal>

        <ScrollReveal delay={160}>
          <section id="trust" className="border-b border-slate-200/70 py-16 dark:border-white/10">
            <LandingTrustSection />
          </section>
        </ScrollReveal>

        <ScrollReveal delay={240}>
          <section
            id="pricing-cta"
            className="border-b border-slate-200/70 bg-slate-50 py-20 dark:border-white/10 dark:bg-[#1A1A24]"
          >
            <LandingPricingCTA />
          </section>
        </ScrollReveal>

        <footer id="footer" className="py-12">
          <div className="flex flex-col gap-6 border-t border-slate-200/70 pt-8 dark:border-white/10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">Seefluencer</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Learn from the best creators.</p>
              </div>

              <nav aria-label="Footer navigation" className="flex flex-wrap items-center gap-3 sm:gap-4">
                <Link
                  href="/#hero"
                  className="inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-medium text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:text-white"
                >
                  Home
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-medium text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:text-white"
                >
                  Courses
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-medium text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:text-white"
                >
                  Pricing
                </Link>
              </nav>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">© 2026 Seefluencer. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
