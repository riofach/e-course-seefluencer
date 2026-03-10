"use client";

import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";
import { GripVertical } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  chapterUpdateSchema,
  type ChapterUpdateInput,
} from "~/lib/validations/chapter";
import {
  createChapter,
  deleteChapter,
  reorderChapters,
} from "~/server/actions/chapters";
import type { ChapterRow } from "~/server/queries/chapters";
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

import { ChapterTitleInput } from "./ChapterTitleInput";

type ChapterListProps = {
  courseId: string;
  initialChapters: ChapterRow[];
};

function createOptimisticChapter(courseId: string, order: number, title: string): ChapterRow {
  return {
    id: -Date.now(),
    courseId: Number(courseId),
    title,
    description: null,
    order,
    createdAt: new Date(),
  };
}

export function ChapterList({ courseId, initialChapters }: ChapterListProps) {
  const [chapters, setChapters] = useState<ChapterRow[]>(initialChapters);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);

  const draftOrder = useMemo(() => chapters.length + 1, [chapters.length]);

  const draftForm = useForm<ChapterUpdateInput>({
    resolver: zodResolver(chapterUpdateSchema),
    mode: "onBlur",
    defaultValues: {
      title: "",
    },
  });

  const handleAddChapter = async () => {
    setIsDrafting(true);
    draftForm.reset({ title: "" });
  };

  const handleCancelDraft = () => {
    setIsDrafting(false);
    draftForm.reset({ title: "" });
  };

  const handleCreateDraftChapter = async () => {
    const currentValues = draftForm.getValues();
    const parsed = chapterUpdateSchema.safeParse(currentValues);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? "Title is required";
      draftForm.setError("title", { message: firstError });
      return;
    }

    setIsCreating(true);

    const result = await createChapter(courseId, parsed.data.title);

    if (!result.success) {
      setIsCreating(false);
      toast.error(`Create failed: ${result.error}`, {
        duration: 4000,
        position: "bottom-right",
      });
      return;
    }

    const newChapter = createOptimisticChapter(courseId, draftOrder, parsed.data.title);

    setChapters((current) => [
      ...current,
      {
        ...newChapter,
        id: result.data.chapterId,
      },
    ]);

    setIsCreating(false);
    setIsDrafting(false);
    draftForm.reset({ title: "" });
    toast.success("Chapter saved", {
      duration: 2000,
      position: "bottom-right",
    });
  };

  const handleDeleteChapter = async (chapterId: number) => {
    setIsDeletingId(chapterId);

    const result = await deleteChapter(String(chapterId));

    if (!result.success) {
      setIsDeletingId(null);
      toast.error(`Delete failed: ${result.error}`, {
        duration: 4000,
        position: "bottom-right",
      });
      return;
    }

    setChapters((current) =>
      current
        .filter((chapter) => chapter.id !== chapterId)
        .map((chapter, index) => ({ ...chapter, order: index + 1 })),
    );

    setIsDeletingId(null);
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const previousChapters = chapters;
    const reordered = Array.from(chapters);
    const [removed] = reordered.splice(result.source.index, 1);

    if (!removed) {
      return;
    }

    reordered.splice(result.destination.index, 0, removed);

    const normalized = reordered.map((chapter, index) => ({
      ...chapter,
      order: index + 1,
    }));

    setChapters(normalized);

    const response = await reorderChapters(
      courseId,
      normalized.map((chapter) => chapter.id),
    );

    if (!response.success) {
      setChapters(previousChapters);
      toast.error(`Reorder failed: ${response.error}`, {
        duration: 4000,
        position: "bottom-right",
      });
      return;
    }

    toast.success("Chapter saved", {
      duration: 2000,
      position: "bottom-right",
    });
  };

  return (
    <section className="bg-white">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-[10px] font-semibold tracking-wider text-gray-600 uppercase">
          Chapters
        </h2>
        <Button
          type="button"
          onClick={handleAddChapter}
          variant="outline"
          size="sm"
          disabled={isCreating}
          className="min-h-[44px] border-indigo-200 text-xs text-indigo-600 hover:bg-indigo-50"
        >
          {isCreating ? "Adding..." : "+ Add Chapter"}
        </Button>
      </div>

      {chapters.length === 0 && !isDrafting ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg
            className="mb-3 h-12 w-12 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p className="mb-3 text-xs text-gray-500">
            No chapters yet. Start building your course structure.
          </p>
          <Button
            type="button"
            onClick={handleAddChapter}
            variant="outline"
            size="sm"
            disabled={isCreating || isDrafting}
            className="min-h-[44px] border-indigo-200 text-xs text-indigo-600 hover:bg-indigo-50"
          >
            + Add First Chapter
          </Button>
        </div>
      ) : (
        <DragDropContext onDragEnd={(result) => void handleDragEnd(result)}>
          <Droppable droppableId={`chapters-${courseId}`}>
            {(droppableProvided) => (
              <div
                ref={droppableProvided.innerRef}
                {...droppableProvided.droppableProps}
                className="space-y-2"
              >
                {isDrafting ? (
                  <div className="rounded-md border border-indigo-200 bg-indigo-50/30 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex min-h-[44px] min-w-[44px] items-center justify-center text-gray-300">
                        <GripVertical size={16} />
                      </div>
                      <span className="text-[11px] text-gray-400">#{draftOrder}</span>
                      <div className="flex-1">
                        <input
                          aria-label="Draft chapter title"
                          autoFocus
                          placeholder="Chapter title..."
                          className="min-h-[44px] w-full border-0 bg-transparent px-1 text-sm font-medium text-gray-900 outline-none focus:border-b focus:border-indigo-500"
                          {...draftForm.register("title")}
                        />
                        {draftForm.formState.errors.title ? (
                          <p className="mt-0.5 text-[11px] text-red-500">
                            {draftForm.formState.errors.title.message}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isCreating}
                          className="min-h-[44px] border-gray-200 text-xs text-gray-600 hover:bg-gray-50"
                          onClick={handleCancelDraft}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={isCreating}
                          className="min-h-[44px] bg-indigo-600 text-xs text-white hover:bg-indigo-700"
                          aria-label="Save chapter"
                          onClick={() => void handleCreateDraftChapter()}
                        >
                          {isCreating ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {chapters.map((chapter, index) => (
                  <Draggable
                    key={chapter.id}
                    draggableId={String(chapter.id)}
                    index={index}
                    isDragDisabled={isDrafting || isCreating}
                  >
                    {(draggableProvided) => (
                      <div
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        className="group flex min-h-[44px] items-center gap-2 rounded-md border border-gray-200 bg-white px-3"
                      >
                        <div
                          {...draggableProvided.dragHandleProps}
                          className="flex min-h-[44px] min-w-[44px] cursor-grab items-center justify-center text-gray-300 group-hover:text-gray-400"
                          aria-label={`Drag ${chapter.title}`}
                        >
                          <GripVertical size={16} />
                        </div>

                        <span className="text-[11px] text-gray-400">
                          #{chapter.order}
                        </span>
                        <ChapterTitleInput chapter={chapter} />
                        <span className="ml-2 text-[10px] text-gray-400">
                          0 lessons
                        </span>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={isDeletingId === chapter.id}
                              className="ml-auto min-h-[44px] min-w-[44px] text-xs text-red-400 hover:text-red-600"
                            >
                              {isDeletingId === chapter.id ? "..." : "Delete"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Chapter?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this chapter and
                                all its Lessons. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  void handleDeleteChapter(chapter.id)
                                }
                                className="bg-red-600 text-white hover:bg-red-700"
                              >
                                Yes, delete chapter
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </Draggable>
                ))}
                {droppableProvided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </section>
  );
}
