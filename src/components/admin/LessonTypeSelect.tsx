"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { LessonUpdateInput } from "~/lib/validations/lesson";
import { updateLesson } from "~/server/actions/lessons";
import type { LessonRow } from "~/server/queries/lessons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

type LessonTypeSelectProps = {
  lesson: LessonRow;
  onSaved?: (type: LessonUpdateInput["type"]) => void;
};

export function LessonTypeSelect({ lesson, onSaved }: LessonTypeSelectProps) {
  const [value, setValue] = useState<LessonUpdateInput["type"]>(
    lesson.type as LessonUpdateInput["type"],
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleValueChange = async (newType: string) => {
    const nextType = newType as LessonUpdateInput["type"];
    setValue(nextType);
    setIsSaving(true);

    const result = await updateLesson(String(lesson.id), {
      title: lesson.title,
      type: nextType,
      videoUrl: nextType === "video" ? lesson.content ?? "" : "",
      content: nextType === "text" ? lesson.content ?? "" : "",
      isFree: lesson.isFree,
    });

    if (!result.success) {
      setValue(lesson.type as LessonUpdateInput["type"]);
      setIsSaving(false);
      toast.error(`Update failed: ${result.error}`, {
        duration: 4000,
        position: "bottom-right",
      });
      return;
    }

    setIsSaving(false);
    onSaved?.(nextType);
    toast.success("Lesson type updated", {
      duration: 2000,
      position: "bottom-right",
    });
  };

  return (
    <Select value={value} onValueChange={(newValue) => void handleValueChange(newValue)}>
      <SelectTrigger
        aria-label={`Lesson type for ${lesson.title}`}
        className="h-[44px] w-[120px] border-gray-200 text-xs"
        disabled={isSaving}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="video">Video</SelectItem>
        <SelectItem value="text">Text</SelectItem>
        <SelectItem value="quiz">Quiz</SelectItem>
      </SelectContent>
    </Select>
  );
}
