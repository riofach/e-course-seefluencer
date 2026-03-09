"use client";

import Link from "next/link";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

type QuizResultDisplayProps = {
  score: number;
  totalPoints: number;
  passed: boolean;
  onRetake: () => void;
  courseSlug: string;
  nextLessonId?: number;
};

export function QuizResultDisplay({
  score,
  totalPoints,
  passed,
  onRetake,
  courseSlug,
  nextLessonId,
}: QuizResultDisplayProps) {
  const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
  const ringColor = passed ? "#22C55E" : "#EF4444";

  return (
    <div className="animate-in fade-in mx-auto flex w-full max-w-sm flex-col items-center gap-6 py-12 text-center duration-500">
      <div
        className="relative flex h-40 w-40 scale-100 items-center justify-center rounded-full transition-all duration-700"
        style={{
          background: `conic-gradient(${ringColor} ${percentage}%, var(--muted) 0)`,
        }}
      >
        <div className="bg-background flex h-28 w-28 flex-col items-center justify-center rounded-full">
          <span className="text-3xl font-bold">{percentage}%</span>
          <span className="text-muted-foreground text-xs">
            {score} / {totalPoints} pts
          </span>
        </div>
      </div>

      <Badge
        variant={passed ? "default" : "destructive"}
        className="px-4 py-1 text-base"
      >
        {passed ? "Passed ✓" : "Failed ✗"}
      </Badge>

      <p className="text-muted-foreground text-sm">
        {passed
          ? "Great job! You cleared this quiz."
          : "You need 70% or more to pass. Review the material and try again."}
      </p>

      {passed && nextLessonId ? (
        <Button asChild className="w-full">
          <Link href={`/courses/${courseSlug}/lessons/${nextLessonId}`}>
            Next Lesson →
          </Link>
        </Button>
      ) : passed ? (
        <Button asChild variant="secondary" className="w-full">
          <Link href={`/courses/${courseSlug}`}>Back to Course</Link>
        </Button>
      ) : (
        <Button onClick={onRetake} variant="outline" className="w-full">
          Retake Quiz
        </Button>
      )}
    </div>
  );
}
