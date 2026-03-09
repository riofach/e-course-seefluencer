"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

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
      <Card>
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
    <Card>
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
