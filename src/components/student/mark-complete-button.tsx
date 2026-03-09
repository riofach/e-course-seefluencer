"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { markLessonComplete } from "~/server/actions/progress/mark-lesson-complete";

type MarkCompleteButtonProps = {
  lessonId: number;
  courseSlug: string;
  lessonType: string;
  isAlreadyCompleted: boolean;
};

import { useOptimisticProgress } from "~/components/student/optimistic-progress-context";

export function MarkCompleteButton({
  lessonId,
  courseSlug,
  lessonType,
  isAlreadyCompleted,
}: MarkCompleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticCompleted, setOptimisticCompleted] =
    useOptimistic(isAlreadyCompleted);
  const progressContext = useOptimisticProgress();

  if (lessonType === "quiz") {
    return null;
  }

  const isCompleted = optimisticCompleted;

  const handleClick = () => {
    startTransition(async () => {
      setOptimisticCompleted(true);
      progressContext?.addOptimisticLesson(lessonId);

      const result = await markLessonComplete(lessonId, courseSlug);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Lesson marked as complete!");
    });
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isPending || isCompleted}
      className={cn(
        "w-full gap-2 rounded-xl py-6 text-sm font-semibold shadow-sm transition-all",
        !isCompleted && "bg-indigo-600 text-white hover:bg-indigo-500",
        isCompleted &&
          "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
      )}
    >
      {isPending ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          <span>Marking...</span>
        </>
      ) : isCompleted ? (
        <>
          <CheckCircle2 className="size-4" />
          <span>Completed</span>
        </>
      ) : (
        <span>Mark as Complete</span>
      )}
    </Button>
  );
}
