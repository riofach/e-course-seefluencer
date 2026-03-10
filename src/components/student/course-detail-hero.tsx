import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import type { CourseDetailItem } from "~/server/courses/course-detail";

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
  progressData?: CourseDetailHeroProgressData;
};

function getFirstLessonHref(course: CourseDetailHeroProps["course"]) {
  const firstLessonId = course.chapters[0]?.lessons[0]?.id;

  return firstLessonId
    ? `/courses/${course.slug}/lessons/${firstLessonId}`
    : `/courses/${course.slug}`;
}

export function CourseDetailHero({ course, progressData }: CourseDetailHeroProps) {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
      <div className="order-2 space-y-4 lg:order-1">
        <Badge variant={course.isFree ? "secondary" : "default"}>
          {course.isFree ? "Free" : "Premium"}
        </Badge>

        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            {course.title}
          </h1>
          <p className="text-muted-foreground max-w-3xl text-base leading-7 sm:text-lg">
            {course.description}
          </p>
        </div>

        <Button asChild className="min-h-11 px-5 text-sm">
          <Link href={getFirstLessonHref(course)}>
            Start Learning
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>

        {progressData !== undefined && (
          <div className="border-b px-0 py-0">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">Progress belajar</p>
              <span className="text-muted-foreground text-sm font-medium">
                {progressData.progressPercent}% complete
              </span>
            </div>
            <Progress
              value={progressData.progressPercent}
              aria-label={`${progressData.progressPercent}% complete`}
            />
          </div>
        )}
      </div>

      <div className="border-border/70 bg-card/70 order-1 overflow-hidden rounded-3xl border shadow-sm lg:order-2">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            width={800}
            height={400}
            className="h-full min-h-64 w-full object-cover"
          />
        ) : (
          <div className="from-primary/15 via-primary/5 to-background flex min-h-64 items-end bg-gradient-to-br p-6 sm:min-h-80">
            <div className="bg-background/85 rounded-2xl border px-4 py-3 shadow-sm">
              <p className="text-sm font-medium">Preview kursus</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Gambar thumbnail belum tersedia.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export { getFirstLessonHref };
