"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  lessonTitleSchema,
  type LessonTitleInput as LessonTitleFormInput,
  type LessonUpdateInput,
} from "~/lib/validations/lesson";
import { updateLesson } from "~/server/actions/lessons";
import type { LessonRow } from "~/server/queries/lessons";

type LessonTitleInputProps = {
  lesson: LessonRow;
  onSaved?: (title: string) => void;
};

export function LessonTitleInput({ lesson, onSaved }: LessonTitleInputProps) {
  const lastSavedValueRef = useRef<string>(
    JSON.stringify({ title: lesson.title } satisfies LessonTitleFormInput),
  );

  const form = useForm<LessonTitleFormInput>({
    resolver: zodResolver(lessonTitleSchema),
    mode: "onBlur",
    defaultValues: {
      title: lesson.title,
    },
  });

  const watchedValues = useWatch({ control: form.control });

  const autoSave = useCallback(
    async (data: LessonTitleFormInput) => {
      const serialized = JSON.stringify(data);

      if (serialized === lastSavedValueRef.current) {
        return;
      }

      const result = await updateLesson(String(lesson.id), {
        title: data.title,
        type: lesson.type as LessonUpdateInput["type"],
        videoUrl: lesson.type === "video" ? lesson.content ?? "" : "",
        content: lesson.type === "text" ? lesson.content ?? "" : "",
        isFree: lesson.isFree,
      });

      if (!result.success) {
        toast.error(`Save failed: ${result.error}`, {
          duration: 4000,
          position: "bottom-right",
        });
        return;
      }

      lastSavedValueRef.current = serialized;
      onSaved?.(data.title);
      toast.success("Lesson saved", {
        duration: 2000,
        position: "bottom-right",
      });
    },
    [lesson.content, lesson.id, lesson.isFree, lesson.type, onSaved],
  );

  useEffect(() => {
    const hasErrors = Object.keys(form.formState.errors).length > 0;

    if (hasErrors) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const currentValues = form.getValues();
      const parsed = lessonTitleSchema.safeParse(currentValues);

      if (parsed.success) {
        void autoSave(parsed.data);
      }
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [autoSave, form, form.formState.errors, watchedValues]);

  return (
    <div className="flex-1">
      <input
        aria-label={`Lesson title for ${lesson.title}`}
        className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        placeholder="Lesson title..."
        {...form.register("title")}
      />
      {form.formState.errors.title ? (
        <p className="mt-0.5 text-[11px] text-red-500">
          {form.formState.errors.title.message}
        </p>
      ) : null}
    </div>
  );
}
