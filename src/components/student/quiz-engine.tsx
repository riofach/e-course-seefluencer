"use client";

import { HelpCircle, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { submitQuiz } from "~/server/actions/progress/submit-quiz";
import type { ClientQuizQuestion } from "~/server/courses/quiz-questions";

type QuizEngineProps = {
  questions: ClientQuizQuestion[];
  lessonId: number;
  courseSlug: string;
};

export function QuizEngine({
  questions,
  lessonId,
  courseSlug,
}: QuizEngineProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isPending, startTransition] = useTransition();

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <HelpCircle className="text-muted-foreground h-12 w-12" />
        <p className="text-muted-foreground">No questions available yet.</p>
      </div>
    );
  }

  const allAnswered = Object.keys(answers).length === questions.length;

  const handleSubmit = () => {
    startTransition(async () => {
      await submitQuiz(lessonId, courseSlug, answers);
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {questions.map((quiz, index) => (
        <fieldset key={quiz.id} className="space-y-3">
          <legend className="text-base font-medium">
            {index + 1}. {quiz.question}
          </legend>

          {(["A", "B", "C", "D"] as const).map((option) => {
            const optionText = quiz[`option${option}` as const];
            const isSelected = answers[quiz.id] === option;

            return (
              <label
                key={option}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50",
                  isSelected &&
                    "border-primary bg-primary/5 ring-primary/20 ring-1",
                )}
              >
                <input
                  type="radio"
                  name={`question-${quiz.id}`}
                  value={option}
                  checked={answers[quiz.id] === option}
                  onChange={() =>
                    setAnswers((prev) => ({ ...prev, [quiz.id]: option }))
                  }
                />
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "text-muted-foreground border-border bg-background",
                  )}
                >
                  {option}
                </span>
                <span className="text-sm leading-relaxed sm:text-base">
                  {optionText}
                </span>
              </label>
            );
          })}
        </fieldset>
      ))}

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!allAnswered || isPending}
        className="w-full gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          <span>Submit Quiz</span>
        )}
      </Button>
    </div>
  );
}
