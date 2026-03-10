"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { cn } from "~/lib/utils";
import { quizUpdateSchema, type QuizUpdateInput } from "~/lib/validations/quiz";
import {
  deleteQuizQuestion,
  updateQuizQuestion,
} from "~/server/actions/quizzes";
import type { QuizRow } from "~/server/queries/quizzes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

type QuizQuestionCardProps = {
  index: number;
  quiz: QuizRow;
  onUpdated: (quiz: QuizRow) => void;
  onDeleted: (quizId: number) => void;
};

type QuizFieldKey = keyof QuizUpdateInput;

const OPTION_KEYS = ["A", "B", "C", "D"] as const;

function getDefaultValues(quiz: QuizRow): QuizUpdateInput {
  return {
    question: quiz.question,
    optionA: quiz.optionA,
    optionB: quiz.optionB,
    optionC: quiz.optionC,
    optionD: quiz.optionD,
    correctAnswer: quiz.correctAnswer as QuizUpdateInput["correctAnswer"],
    points: quiz.points,
  };
}

export function QuizQuestionCard({
  index,
  quiz,
  onUpdated,
  onDeleted,
}: QuizQuestionCardProps) {
  const [saveError, setSaveError] = useState<QuizFieldKey | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const lastSavedValueRef = useRef<string>(
    JSON.stringify(getDefaultValues(quiz)),
  );

  const form = useForm<QuizUpdateInput>({
    resolver: zodResolver(quizUpdateSchema),
    mode: "onBlur",
    defaultValues: getDefaultValues(quiz),
  });

  const watchedValues = useWatch({ control: form.control });
  const currentCorrectAnswer = form.watch("correctAnswer");

  useEffect(() => {
    const nextValues = getDefaultValues(quiz);
    form.reset(nextValues);
    lastSavedValueRef.current = JSON.stringify(nextValues);
  }, [form, quiz]);

  const markFieldError = useCallback((field: QuizFieldKey) => {
    setSaveError(field);
    window.setTimeout(() => {
      setSaveError((current) => (current === field ? null : current));
    }, 3000);
  }, []);

  const persistQuiz = useCallback(
    async (
      data: QuizUpdateInput,
      successMessage: string,
      errorField: QuizFieldKey,
    ) => {
      const result = await updateQuizQuestion(String(quiz.id), data);

      if (!result.success) {
        markFieldError(errorField);
        toast.error(`Save failed: ${result.error}`, {
          duration: 4000,
          position: "bottom-right",
        });
        return false;
      }

      lastSavedValueRef.current = JSON.stringify(data);
      onUpdated({
        ...quiz,
        ...data,
      });

      toast.success(successMessage, {
        duration: 2000,
        position: "bottom-right",
      });

      return true;
    },
    [markFieldError, onUpdated, quiz],
  );

  const autoSave = useCallback(
    async (data: QuizUpdateInput) => {
      const serialized = JSON.stringify(data);

      if (serialized === lastSavedValueRef.current) {
        return;
      }

      await persistQuiz(data, "Question saved", "question");
    },
    [persistQuiz],
  );

  useEffect(() => {
    if (Object.keys(form.formState.errors).length > 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const currentValues = form.getValues();
      const parsed = quizUpdateSchema.safeParse(currentValues);

      if (parsed.success) {
        void autoSave(parsed.data);
      }
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [autoSave, form, form.formState.errors, watchedValues]);

  const inputClassName = useCallback(
    (field: QuizFieldKey, extraClassName?: string) =>
      cn(
        "w-full rounded-md border px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400",
        saveError === field
          ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500"
          : "border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500",
        extraClassName,
      ),
    [saveError],
  );

  const optionFieldMap = useMemo(
    () =>
      ({
        A: "optionA",
        B: "optionB",
        C: "optionC",
        D: "optionD",
      }) satisfies Record<(typeof OPTION_KEYS)[number], QuizFieldKey>,
    [],
  );

  const handleCorrectAnswerSave = async (
    answer: QuizUpdateInput["correctAnswer"],
  ) => {
    form.setValue("correctAnswer", answer, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    const parsed = quizUpdateSchema.safeParse(form.getValues());

    if (!parsed.success) {
      markFieldError("correctAnswer");
      toast.error(
        `Save failed: ${parsed.error.errors[0]?.message ?? "Invalid quiz payload."}`,
        {
          duration: 4000,
          position: "bottom-right",
        },
      );
      return;
    }

    await persistQuiz(parsed.data, "Answer saved", "correctAnswer");
  };

  const handlePointsBlur = async () => {
    const rawValue = form.getValues("points");
    const nextPoints = Number(rawValue);

    form.setValue("points", nextPoints, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

    const parsed = quizUpdateSchema.safeParse(form.getValues());

    if (!parsed.success) {
      markFieldError("points");
      toast.error(
        `Save failed: ${parsed.error.errors[0]?.message ?? "Invalid quiz payload."}`,
        {
          duration: 4000,
          position: "bottom-right",
        },
      );
      return;
    }

    await persistQuiz(parsed.data, "Question saved", "points");
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    const result = await deleteQuizQuestion(String(quiz.id));

    if (!result.success) {
      setIsDeleting(false);
      toast.error(`Delete failed: ${result.error}`, {
        duration: 4000,
        position: "bottom-right",
      });
      return;
    }

    onDeleted(quiz.id);
    setIsDeleting(false);
  };

  return (
    <div className="mb-3 rounded-md border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
          Question {index + 1}
        </span>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
              aria-label={`Delete question ${index + 1}`}
              disabled={isDeleting}
            >
              <Trash2 size={14} />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Question?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this quiz question. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => void handleDelete()}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Yes, delete question
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <label className="mb-1 block text-[10px] font-semibold tracking-wider text-gray-600 uppercase">
        Question
      </label>
      <textarea
        aria-label={`Question text ${index + 1}`}
        className={inputClassName("question", "min-h-[80px] resize-none")}
        {...form.register("question")}
      />

      <div className="mt-3 space-y-2">
        {OPTION_KEYS.map((letter) => {
          const optionField = optionFieldMap[letter];

          return (
            <div
              key={letter}
              className={cn(
                "flex min-h-[44px] items-center gap-2 rounded-md px-2 transition-colors duration-150",
                currentCorrectAnswer === letter ? "bg-indigo-50" : "bg-white",
              )}
            >
              <label
                className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center"
                aria-label={`Mark option ${letter} as correct`}
              >
                <input
                  type="radio"
                  name={`correct-${quiz.id}`}
                  value={letter}
                  checked={currentCorrectAnswer === letter}
                  onChange={() => void handleCorrectAnswerSave(letter)}
                  className="h-6 w-6 cursor-pointer accent-indigo-600"
                />
              </label>
              <label className="w-5 shrink-0 text-[14px] font-semibold text-gray-600">
                {letter}
              </label>
              <input
                type="text"
                aria-label={`Option ${letter}`}
                className={inputClassName(optionField, "min-h-[44px]")}
                {...form.register(optionField)}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <label className="text-[10px] font-semibold tracking-wider text-gray-600 uppercase">
          Points
        </label>
        <input
          type="number"
          min={1}
          max={1000}
          aria-label="Question points"
          className={inputClassName("points", "min-h-[44px] w-20")}
          {...form.register("points", { valueAsNumber: true })}
          onBlur={() => void handlePointsBlur()}
        />
      </div>
    </div>
  );
}
