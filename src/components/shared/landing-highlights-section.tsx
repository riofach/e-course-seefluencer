import Link from "next/link";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

const highlights = [
  {
    title: "Social Media Mastery",
    tagline:
      "Build a consistent content engine with practical lessons on hooks, formats, and growth loops. Ideal for creators starting their brand.",
    chapters: 4,
    lessons: 18,
    access: "Free",
  },
  {
    title: "YouTube Storytelling",
    tagline:
      "Learn how top creators script stronger narratives, keep retention high, and turn long-form videos into binge-worthy series.",
    chapters: 6,
    lessons: 24,
    access: "Premium",
  },
  {
    title: "Content Creator Bootcamp",
    tagline:
      "A guided path for creators who want to sharpen strategy, publishing systems, and audience trust with structured milestones.",
    chapters: 8,
    lessons: 32,
    access: "Premium",
  },
] as const;

export function LandingHighlightsSection() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-400">
          Featured learning highlights
        </p>
        <h2 className="mt-4 font-[family-name:var(--font-playfair-display)] text-3xl font-bold sm:text-4xl">
          Explore courses built for modern creator growth
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300">
          Preview the kind of structured, creator-led learning experiences waiting inside Seefluencer before you browse the full catalog.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {highlights.map((course) => (
          <Card
            key={course.title}
            className="rounded-[24px] border border-slate-200/80 bg-white py-0 shadow-sm dark:border-[#2A2A3C] dark:bg-[#1A1A24]"
          >
            <CardContent className="flex h-full flex-col gap-6 p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex min-h-8 items-center rounded-full bg-slate-100 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {course.access}
                </span>
                <span className="inline-flex min-h-8 items-center rounded-full bg-indigo-50 px-3 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                  {course.chapters} chapters
                </span>
                <span className="inline-flex min-h-8 items-center rounded-full bg-teal-50 px-3 text-xs font-semibold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                  {course.lessons} lessons
                </span>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{course.title}</h3>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{course.tagline}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button
          asChild
          variant="outline"
          className="min-h-[44px] rounded-full border-slate-300 px-8 text-base font-semibold text-slate-900 dark:border-[#2A2A3C] dark:bg-transparent dark:text-white"
        >
          <Link href="/courses">Browse All Courses</Link>
        </Button>
      </div>
    </div>
  );
}
