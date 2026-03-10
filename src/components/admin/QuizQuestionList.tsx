"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { createQuizQuestion } from "~/server/actions/quizzes";
import type { QuizRow } from "~/server/queries/quizzes";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";

import { QuizQuestionCard } from "./QuizQuestionCard";

type QuizQuestionListProps = {
  lessonId: number;
  initialQuizzes: QuizRow[];
};

function createOptimisticQuiz(lessonId: number, id: number): QuizRow {
  return {
    id,
    lessonId,
    question: "New Question",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    points: 10,
    createdAt: new Date(),
  };
}

export function QuizQuestionList({ lessonId, initialQuizzes }: QuizQuestionListProps) {
  const [quizzes, setQuizzes] = useState<QuizRow[]>(initialQuizzes);
  const [isCreating, setIsCreating] = useState(false);

  const sortedQuizzes = useMemo(
    () => [...quizzes].sort((left, right) => left.id - right.id),
    [quizzes],
  );

  const handleAddQuestion = async () => {
    setIsCreating(true);

    const result = await createQuizQuestion(String(lessonId));

    if (!result.success) {
      setIsCreating(false);
      toast.error(`Save failed: ${result.error}`, {
        duration: 4000,
        position: "bottom-right",
      });
      return;
    }

    setQuizzes((current) => [...current, createOptimisticQuiz(lessonId, result.data.quizId)]);
    setIsCreating(false);
    toast.success("Question added", {
      duration: 2000,
      position: "bottom-right",
    });
  };

  return (
    <section>
      {sortedQuizzes.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <svg
            className="mb-3 h-10 w-10 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mb-1 text-sm font-medium text-gray-700">No questions yet</p>
          <p className="mb-4 text-xs text-gray-400">Add your first question to build this quiz.</p>
          <Button
            type="button"
            onClick={() => void handleAddQuestion()}
            variant="outline"
            size="sm"
            className="min-h-[44px] border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            disabled={isCreating}
          >
            + Add First Question
          </Button>
        </div>
      ) : (
        <div>
          {sortedQuizzes.map((quiz, index) => (
            <QuizQuestionCard
              key={quiz.id}
              index={index}
              quiz={quiz}
              onUpdated={(updatedQuiz) => {
                setQuizzes((current) =>
                  current.map((item) => (item.id === updatedQuiz.id ? updatedQuiz : item)),
                );
              }}
              onDeleted={(quizId) => {
                setQuizzes((current) => current.filter((item) => item.id !== quizId));
              }}
            />
          ))}

          <Button
            type="button"
            onClick={() => void handleAddQuestion()}
            variant="ghost"
            size="sm"
            disabled={isCreating}
            className="mt-4 h-[36px] w-full border border-dashed border-gray-300 text-xs font-medium text-gray-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
          >
            {isCreating ? "Adding..." : "+ Add Question"}
          </Button>
        </div>
      )}

      {isCreating ? (
        <div className="mt-3 space-y-3">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-[120px] w-full rounded-md" />
          ))}
        </div>
      ) : null}
    </section>
  );
}
