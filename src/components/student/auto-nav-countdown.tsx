"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";

type AutoNavCountdownProps = {
  nextLesson: { id: number; title: string } | null;
  courseSlug: string;
  currentLessonType: string;
};

export function AutoNavCountdown({
  nextLesson,
  courseSlug,
  currentLessonType,
}: AutoNavCountdownProps) {
  const router = useRouter();
  const cardClassName = cn(
    "border-slate-200/80 bg-white/95 text-slate-950 shadow-sm shadow-slate-200/70 backdrop-blur supports-[backdrop-filter]:bg-white/90",
    "dark:border-[#2A2A3C] dark:bg-[#1A1A24] dark:text-slate-50 dark:shadow-black/20 dark:supports-[backdrop-filter]:bg-[#1A1A24]/95",
  );
  const nextLessonHref = useMemo(() => {
    if (nextLesson === null) {
      return null;
    }

    return `/courses/${courseSlug}/lessons/${nextLesson.id}`;
  }, [courseSlug, nextLesson]);

  if (currentLessonType === "quiz") {
    return null;
  }

  if (nextLesson === null) {
    return (
      <Card className={cardClassName}>
        <CardContent className="py-5">
          <p className="text-base font-semibold">You&apos;ve completed all lessons!</p>
          <p className="text-muted-foreground mt-1 text-sm">
            You&apos;ve reached the end of this course.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cardClassName}>
      <CardContent className="space-y-4 py-5">
        <div className="space-y-1">
          <p className="text-sm font-medium">Up next: {nextLesson.title}</p>
          <p className="text-muted-foreground text-sm">
            Lanjut ke lesson berikutnya saat kamu siap. Tidak ada perpindahan otomatis.
          </p>
        </div>

        <Button
          type="button"
          onClick={() => {
            if (nextLessonHref) {
              router.push(nextLessonHref);
            }
          }}
        >
          Next lesson
        </Button>
      </CardContent>
    </Card>
  );
}
