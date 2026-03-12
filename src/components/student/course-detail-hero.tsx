import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, PlayCircle, Sparkles } from "lucide-react";

import { ThumbnailWithFallback } from "~/components/shared/thumbnail-with-fallback";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import type { CourseDetailItem } from "~/server/courses/course-detail";
import type { CourseLandingCta } from "~/app/(student)/courses/[slug]/page.helpers";

export type CourseDetailHeroProgressData = {
  progressPercent: number;
  completedCount: number;
  totalLessons: number;
};

type CourseDetailHeroProps = {
  course: Pick<
    CourseDetailItem,
    "title" | "description" | "thumbnailUrl" | "isFree" | "chapters" | "slug"
  >;
  cta: CourseLandingCta;
  progressData?: CourseDetailHeroProgressData;
};

function getCourseStats(course: CourseDetailHeroProps["course"]) {
  const lessonCount = course.chapters.reduce(
    (total, chapter) => total + chapter.lessons.length,
    0,
  );

  return {
    chapterCount: course.chapters.length,
    lessonCount,
  };
}

export function CourseDetailHero({ course, cta, progressData }: CourseDetailHeroProps) {
  const stats = getCourseStats(course);

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-[linear-gradient(135deg,_rgba(255,245,245,0.88)_0%,_rgba(255,255,255,0.96)_42%,_rgba(238,248,255,0.92)_100%)] px-6 py-8 text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,0.1)] dark:border-white/10 dark:bg-[#1A1A24] dark:text-white dark:shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:px-8 lg:px-10 lg:py-10">
      <div className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 rounded-full bg-gradient-to-br from-[#FF6B6B]/10 via-[#9B59B6]/10 to-[#1ABC9C]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-[#6366F1]/10 blur-3xl" />

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:items-center">
        <div className="order-2 space-y-6 lg:order-1">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              className={course.isFree
                ? "border border-teal-500/20 bg-teal-500/20 px-3 py-1 text-teal-400"
                : "border border-indigo-500/20 bg-indigo-500/20 px-3 py-1 text-indigo-400"
              }
            >
              {course.isFree ? "Free" : "Premium"}
            </Badge>
            <span className="text-sm font-medium tracking-[-0.02em] text-slate-600 dark:text-slate-300">
              Persuasive course landing page • public preview
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="font-display bg-gradient-to-r from-[#FF6B6B] via-[#9B59B6] to-[#1ABC9C] bg-clip-text text-4xl font-bold tracking-tight text-balance text-transparent sm:text-5xl lg:text-6xl">
              {course.title}
            </h1>
            <p className="max-w-3xl text-base leading-8 tracking-[-0.02em] text-slate-600 dark:text-slate-300 sm:text-lg">
              {course.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm tracking-[-0.02em] text-slate-700 dark:text-slate-200">
            <div className="flex min-h-11 items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
              <BookOpen className="size-4 text-[#1ABC9C]" aria-hidden="true" />
              <span>{stats.chapterCount} chapters</span>
            </div>
            <div className="flex min-h-11 items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
              <PlayCircle className="size-4 text-[#FF6B6B]" aria-hidden="true" />
              <span>{stats.lessonCount} lessons</span>
            </div>
            <div className="flex min-h-11 items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-4 py-2 shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none">
              <Clock3 className="size-4 text-[#9B59B6]" aria-hidden="true" />
              <span>Structured, chapter-based learning flow</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild className="min-h-[44px] rounded-full bg-indigo-600 px-6 text-sm text-white hover:bg-violet-500">
              <Link href={cta.href}>
                {cta.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <p className="max-w-xl text-sm leading-6 tracking-[-0.02em] text-slate-500 dark:text-slate-400">
              {cta.helperText}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4 shadow-sm dark:border-[#2A2A3C] dark:bg-[#14141C] dark:shadow-none">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">
                Value snapshot
              </p>
              <p className="mt-2 text-sm leading-6 tracking-[-0.02em] text-slate-600 dark:text-slate-300">
                Preview the full course structure and understand exactly what you&apos;ll unlock before committing.
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4 shadow-sm dark:border-[#2A2A3C] dark:bg-[#14141C] dark:shadow-none">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">
                Who it&apos;s for
              </p>
              <p className="mt-2 text-sm leading-6 tracking-[-0.02em] text-slate-600 dark:text-slate-300">
                Learners who want a guided curriculum, clear milestones, and premium pacing without noise.
              </p>
            </div>
            <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4 shadow-sm dark:border-[#2A2A3C] dark:bg-[#14141C] dark:shadow-none">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-[#1ABC9C]" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">
                  Trust layer
                </p>
              </div>
              <p className="mt-2 text-sm leading-6 tracking-[-0.02em] text-slate-600 dark:text-slate-300">
                Same premium public-zone rhythm as the homepage, pricing, and course catalog for consistent confidence.
              </p>
            </div>
          </div>

          {progressData !== undefined && (
            <div className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm dark:border-[#2A2A3C] dark:bg-[#14141C] dark:shadow-none">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold tracking-[-0.02em] text-slate-900 dark:text-white">Learning progress</p>
                <span className="text-sm font-medium tracking-[-0.02em] text-slate-500 dark:text-slate-400">
                  {progressData.progressPercent}% complete
                </span>
              </div>
              <Progress
                value={progressData.progressPercent}
                aria-label={`${progressData.progressPercent}% complete`}
              />
              <p className="mt-3 text-xs leading-5 tracking-[-0.02em] text-slate-500 dark:text-slate-400">
                {progressData.completedCount} dari {progressData.totalLessons} lesson sudah selesai.
              </p>
            </div>
          )}
        </div>

        <div className="order-1 lg:order-2">
          <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)] dark:border-[#2A2A3C] dark:bg-[#14141C] dark:shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
            <ThumbnailWithFallback
              src={course.thumbnailUrl}
              alt={course.title}
              className="h-full min-h-[280px] w-full object-cover lg:min-h-[420px]"
              fallback={<CourseDetailHeroThumbnailFallback />}
              testId="course-detail-thumbnail"
            />

            <div className="grid gap-4 border-t border-slate-200/80 px-6 py-5 dark:border-[#2A2A3C] sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Access model
                </p>
                <p className="mt-2 text-sm leading-6 tracking-[-0.02em] text-slate-600 dark:text-slate-300">
                  {course.isFree
                    ? "Open for every learner who wants to sample the experience and start progressing fast."
                    : "Premium curriculum designed for learners who want the full lesson path, reinforcement, and momentum."}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  CTA hierarchy
                </p>
                <p className="mt-2 text-sm leading-6 tracking-[-0.02em] text-slate-600 dark:text-slate-300">
                  Primary action is visible above the fold, with repeated reinforcement lower on the page for conversion continuity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CourseDetailHeroThumbnailFallback() {
  return (
    <div className="flex min-h-[280px] items-end bg-gradient-to-br from-[#FF6B6B]/25 via-[#9B59B6]/20 to-[#1ABC9C]/15 p-6 lg:min-h-[420px]">
      <div className="rounded-[24px] border border-white/60 bg-white/75 p-5 backdrop-blur-sm dark:border-white/15 dark:bg-black/30">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">
          Course preview
        </p>
        <p className="mt-2 max-w-xs font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Premium-looking landing hero even before the thumbnail is uploaded.
        </p>
        <p className="mt-3 text-sm leading-6 tracking-[-0.02em] text-slate-600 dark:text-slate-300">
          Visual placeholder keeps the page polished while content assets are still being prepared.
        </p>
      </div>
    </div>
  );
}
