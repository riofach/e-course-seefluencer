"use client";

import { FileText, HelpCircle, Plus, Trash2, Video } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import type { LessonUpdateInput } from "~/lib/validations/lesson";
import { createLesson, deleteLesson, updateLesson } from "~/server/actions/lessons";
import type { LessonRow } from "~/server/queries/lessons";
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
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Switch } from "~/components/ui/switch";

import { LessonTitleInput } from "./LessonTitleInput";
import { LessonTypeSelect } from "./LessonTypeSelect";

type LessonListProps = {
  courseId: number;
  chapterId: number;
  initialLessons: LessonRow[];
};

function getTypeIcon(type: string) {
  switch (type) {
    case "video":
      return <Video size={14} />;
    case "text":
      return <FileText size={14} />;
    case "quiz":
      return <HelpCircle size={14} />;
    default:
      return <Video size={14} />;
  }
}

function createOptimisticLesson(chapterId: number, order: number): LessonRow {
  return {
    id: -Date.now(),
    chapterId,
    title: "New Lesson",
    type: "video",
    content: null,
    isFree: false,
    order,
    createdAt: new Date(),
  };
}

export function LessonList({ courseId, chapterId, initialLessons }: LessonListProps) {
  const [lessons, setLessons] = useState<LessonRow[]>(initialLessons);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);

  const handleAddLesson = async () => {
    setIsCreating(true);

    const result = await createLesson(String(chapterId));

    if (!result.success) {
      setIsCreating(false);
      toast.error(`Create failed: ${result.error}`, {
        duration: 4000,
        position: "bottom-right",
      });
      return;
    }

    const optimistic = createOptimisticLesson(chapterId, lessons.length + 1);

    setLessons((current) => [
      ...current,
      {
        ...optimistic,
        id: result.data.lessonId,
      },
    ]);

    setIsCreating(false);
    toast.success("Lesson created", {
      duration: 2000,
      position: "bottom-right",
    });
  };

  const handleDeleteLesson = async (lessonId: number) => {
    setIsDeletingId(lessonId);

    const result = await deleteLesson(String(lessonId));

    if (!result.success) {
      setIsDeletingId(null);
      toast.error(`Delete failed: ${result.error}`, {
        duration: 4000,
        position: "bottom-right",
      });
      return;
    }

    setLessons((current) =>
      current
        .filter((lesson) => lesson.id !== lessonId)
        .map((lesson, index) => ({ ...lesson, order: index + 1 })),
    );

    setIsDeletingId(null);
  };

  const updateLocalLesson = (lessonId: number, data: Partial<LessonRow>) => {
    setLessons((current) =>
      current.map((lesson) =>
        lesson.id === lessonId
          ? {
              ...lesson,
              ...data,
            }
          : lesson,
      ),
    );
  };

  const handleContentSave = async (
    lesson: LessonRow,
    data: Pick<LessonUpdateInput, "videoUrl" | "content">,
  ) => {
    const result = await updateLesson(String(lesson.id), {
      title: lesson.title,
      type: lesson.type as LessonUpdateInput["type"],
      videoUrl: data.videoUrl ?? "",
      content: data.content ?? "",
      isFree: lesson.isFree,
    });

    if (!result.success) {
      toast.error(`Save failed: ${result.error}`, {
        duration: 4000,
        position: "bottom-right",
      });
      return;
    }

    updateLocalLesson(lesson.id, {
      content:
        lesson.type === "video"
          ? data.videoUrl?.trim() ?? null
          : lesson.type === "text"
            ? data.content?.trim() ?? null
            : null,
    });

    toast.success("Lesson saved", {
      duration: 2000,
      position: "bottom-right",
    });
  };

  const handleAccessToggle = async (lesson: LessonRow, checked: boolean) => {
    const nextIsFree = checked;

    updateLocalLesson(lesson.id, { isFree: nextIsFree });

    const result = await updateLesson(String(lesson.id), {
      title: lesson.title,
      type: lesson.type as LessonUpdateInput["type"],
      videoUrl: lesson.type === "video" ? lesson.content ?? "" : "",
      content: lesson.type === "text" ? lesson.content ?? "" : "",
      isFree: nextIsFree,
    });

    if (!result.success) {
      updateLocalLesson(lesson.id, { isFree: lesson.isFree });
      toast.error(`Update failed: ${result.error}`, {
        duration: 4000,
        position: "bottom-right",
      });
      return;
    }

    toast.success("Lesson saved", {
      duration: 2000,
      position: "bottom-right",
    });
  };

  return (
    <div className="space-y-2" data-testid={`lesson-list-${chapterId}`}>
      {lessons.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <svg
            className="mb-2 h-8 w-8 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
            />
          </svg>
          <p className="mb-2 text-xs text-gray-400">No lessons in this chapter yet.</p>
          <Button
            type="button"
            onClick={() => void handleAddLesson()}
            variant="outline"
            size="sm"
            disabled={isCreating}
            className="min-h-[44px] border-indigo-200 text-xs text-indigo-600 hover:bg-indigo-50"
          >
            + Add First Lesson
          </Button>
        </div>
      ) : null}

      {lessons.map((lesson) => (
        <div
          key={lesson.id}
          className="mb-1 rounded-md border border-gray-100 bg-gray-50 px-3 py-2"
        >
          <div className="flex min-h-[44px] items-center gap-2">
            <span className="flex w-14 shrink-0 items-center justify-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-center text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
              {getTypeIcon(lesson.type)}
              {lesson.type}
            </span>

            <LessonTitleInput
              lesson={lesson}
              onSaved={(title) => {
                updateLocalLesson(lesson.id, { title });
              }}
            />

            <LessonTypeSelect
              lesson={lesson}
              onSaved={(type) => {
                updateLocalLesson(lesson.id, {
                  type,
                  content: type === "quiz" ? null : lesson.content,
                });
              }}
            />

            <div className="ml-auto flex min-h-[44px] min-w-[152px] items-center justify-between gap-3 rounded-md border border-gray-200 bg-white px-3 py-2">
              <label
                htmlFor={`lesson-access-${lesson.id}`}
                className="text-[10px] font-semibold uppercase tracking-wider text-gray-600"
              >
                Premium
              </label>
              <Switch
                id={`lesson-access-${lesson.id}`}
                checked={lesson.isFree}
                onCheckedChange={(checked) => {
                  void handleAccessToggle(lesson, checked);
                }}
                aria-label={`Premium toggle for ${lesson.title}`}
                className="h-[24px] w-10 data-[state=checked]:bg-indigo-600 data-[state=unchecked]:bg-gray-200"
              />
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className="ml-auto flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete lesson"
                  disabled={isDeletingId === lesson.id}
                >
                  <Trash2 size={14} />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Lesson?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this lesson. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => void handleDeleteLesson(lesson.id)}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Yes, delete lesson
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {lesson.type === "video" ? (
            <div className="mt-2">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                Video URL
              </label>
              <input
                aria-label={`Video URL for ${lesson.title}`}
                defaultValue={lesson.content ?? ""}
                className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                onBlur={(event) => {
                  void handleContentSave(lesson, {
                    videoUrl: event.currentTarget.value,
                    content: "",
                  });
                }}
              />
            </div>
          ) : null}

          {lesson.type === "text" ? (
            <div className="mt-2">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                Content
              </label>
              <textarea
                aria-label={`Content for ${lesson.title}`}
                defaultValue={lesson.content ?? ""}
                className="min-h-[100px] w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                onBlur={(event) => {
                  void handleContentSave(lesson, {
                    videoUrl: "",
                    content: event.currentTarget.value,
                  });
                }}
              />
            </div>
          ) : null}

          {lesson.type === "quiz" ? (
            <div className="mt-2 px-3 pb-3">
              <Link
                href={`/admin/courses/${courseId}/lessons/${lesson.id}/quiz`}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-indigo-200 px-3 py-2 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
              >
                <HelpCircle size={12} />
                Manage Quiz Questions
              </Link>
            </div>
          ) : null}
        </div>
      ))}

      {isCreating ? (
        <div className="space-y-1">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-[44px] w-full rounded-md" />
          ))}
        </div>
      ) : null}

      {lessons.length > 0 ? (
        <Button
          type="button"
          onClick={() => void handleAddLesson()}
          variant="ghost"
          size="sm"
          disabled={isCreating}
          className="mt-2 h-[36px] w-full border border-dashed border-gray-300 text-xs font-medium text-gray-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
        >
          <Plus size={14} />
          {isCreating ? "Adding..." : "+ Add Lesson"}
        </Button>
      ) : null}
    </div>
  );
}
