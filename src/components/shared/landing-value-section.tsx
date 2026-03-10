import { BookOpenCheck, Sparkles, TrendingUp } from "lucide-react";

import { Card, CardContent } from "~/components/ui/card";

const benefits = [
  {
    title: "Learn from Real Creators",
    description:
      "Curated courses built by influencers with real-world expertise and practical insights you can apply right away.",
    icon: Sparkles,
  },
  {
    title: "Structured Learning Path",
    description:
      "Move chapter by chapter through a guided curriculum that keeps every lesson focused and easy to follow.",
    icon: BookOpenCheck,
  },
  {
    title: "Track Your Progress",
    description:
      "Stay motivated with clear milestones, quiz checkpoints, and momentum that turns lessons into real progress.",
    icon: TrendingUp,
  },
] as const;

export function LandingValueSection() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-400">
          Why creators choose Seefluencer
        </p>
        <h2 className="mt-4 font-[family-name:var(--font-playfair-display)] text-3xl font-bold sm:text-4xl">
          Learning designed for ambitious digital creators
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
          Seefluencer blends creator insight, practical lesson structure, and visible progress so every course feels premium from the first chapter.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {benefits.map(({ title, description, icon: Icon }) => (
          <Card
            key={title}
            className="rounded-[24px] border border-slate-200/80 bg-white py-0 shadow-sm dark:border-[#2A2A3C] dark:bg-[#1A1A24]"
          >
            <CardContent className="flex h-full flex-col gap-5 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                <Icon aria-hidden="true" className="size-6" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
