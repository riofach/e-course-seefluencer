"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  chapterUpdateSchema,
  type ChapterUpdateInput,
} from "~/lib/validations/chapter";
import { cn } from "~/lib/utils";
import { updateChapter } from "~/server/actions/chapters";
import type { ChapterRow } from "~/server/queries/chapters";

type ChapterTitleInputProps = {
  chapter: ChapterRow;
  autoFocus?: boolean;
  onSaved?: (title: string) => void;
};

export function ChapterTitleInput({
  chapter,
  autoFocus = false,
  onSaved,
}: ChapterTitleInputProps) {
  const lastSavedValueRef = useRef<string>(
    JSON.stringify({ title: chapter.title } satisfies ChapterUpdateInput),
  );

  const form = useForm<ChapterUpdateInput>({
    resolver: zodResolver(chapterUpdateSchema),
    mode: "onBlur",
    defaultValues: {
      title: chapter.title,
    },
  });

  const watchedValues = useWatch({ control: form.control });

  const autoSave = useCallback(
    async (data: ChapterUpdateInput) => {
      const serialized = JSON.stringify(data);

      if (serialized === lastSavedValueRef.current) {
        return;
      }

      const result = await updateChapter(String(chapter.id), data);

      if (!result.success) {
        toast.error(`Save failed: ${result.error}`, {
          duration: 4000,
          position: "bottom-right",
        });
        return;
      }

      lastSavedValueRef.current = serialized;
      onSaved?.(data.title);
      toast.success("Chapter saved", {
        duration: 2000,
        position: "bottom-right",
      });
    },
    [chapter.id, onSaved],
  );

  useEffect(() => {
    const hasErrors = Object.keys(form.formState.errors).length > 0;

    if (hasErrors) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const currentValues = form.getValues();
      const parsed = chapterUpdateSchema.safeParse(currentValues);

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
        aria-label={`Chapter title for ${chapter.title}`}
        className={cn(
          "w-full border-0 bg-transparent px-1 text-sm font-medium text-gray-900 outline-none",
          "min-h-[44px] focus:border-b focus:border-indigo-500",
        )}
        autoFocus={autoFocus}
        placeholder="Chapter title..."
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
