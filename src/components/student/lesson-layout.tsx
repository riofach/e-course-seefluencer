"use client";

import { PanelLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState, useOptimistic } from "react";

import { CourseSidebarNav } from "~/components/student/course-sidebar-nav";
import { OptimisticProgressContext } from "~/components/student/optimistic-progress-context";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import type { SidebarChapter } from "~/server/courses/lesson-navigation.shared";

type LessonLayoutProps = {
  children: ReactNode;
  courseSlug: string;
  chapters: SidebarChapter[];
  activeLessonId: number;
  completedLessonIds: number[];
  progressPercent: number;
};

export function LessonLayout({
  children,
  courseSlug,
  chapters,
  activeLessonId,
  completedLessonIds,
}: LessonLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [optimisticCompletedIds, addOptimisticId] = useOptimistic(
    completedLessonIds,
    (state: number[], newId: number) => {
      if (state.includes(newId)) return state;
      return [...state, newId];
    },
  );

  const totalLessons = useMemo(() => {
    return chapters.reduce((acc, chap) => acc + chap.lessons.length, 0);
  }, [chapters]);

  const optimisticProgressPercent = useMemo(() => {
    if (totalLessons === 0) return 0;
    return Math.round((optimisticCompletedIds.length / totalLessons) * 100);
  }, [optimisticCompletedIds.length, totalLessons]);

  const sidebarProps = useMemo(
    () => ({
      courseSlug,
      chapters,
      activeLessonId,
      completedLessonIds: optimisticCompletedIds,
      progressPercent: optimisticProgressPercent,
      onLessonSelected: () => setIsSidebarOpen(false),
    }),
    [
      activeLessonId,
      chapters,
      optimisticCompletedIds,
      courseSlug,
      optimisticProgressPercent,
    ],
  );

  return (
    <OptimisticProgressContext.Provider
      value={useMemo(
        () => ({ addOptimisticLesson: addOptimisticId }),
        [addOptimisticId],
      )}
    >
      <section className="min-h-[calc(100vh-3.5rem)] bg-[#0F0F14] font-[family-name:var(--font-inter)] tracking-[-0.02em] text-slate-50">
        <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-14">
          <div className="mb-4 lg:hidden">
            <Button
              type="button"
              variant="outline"
              className="sticky top-20 z-20 min-h-11 border-[#2A2A3C] bg-[#1A1A24] text-slate-100 shadow-sm hover:bg-[#232332] hover:text-white focus-visible:border-indigo-500 focus-visible:ring-indigo-500/50"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <PanelLeft className="size-4" />
              Sidebar
            </Button>
          </div>

          <div className="flex items-start gap-6">
            <aside className="sticky top-20 hidden h-[calc(100vh-7rem)] w-[280px] shrink-0 overflow-hidden rounded-xl border border-[#2A2A3C] bg-[#1A1A24] shadow-sm lg:block">
              <CourseSidebarNav {...sidebarProps} />
            </aside>

            <div className="min-w-0 flex-1 text-slate-50">{children}</div>
          </div>
        </div>

        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent
            side="left"
            className="w-[280px] border-r-[#2A2A3C] bg-[#1A1A24] p-0 text-slate-50 sm:max-w-[280px]"
          >
            <SheetHeader className="border-b border-[#2A2A3C] px-4 py-4 text-left">
              <SheetTitle className="text-slate-50">Course navigation</SheetTitle>
              <SheetDescription className="text-slate-400">
                Pilih chapter dan lesson untuk lanjut belajar.
              </SheetDescription>
            </SheetHeader>

            <div className="h-[calc(100%-4.5rem)]">
              <CourseSidebarNav {...sidebarProps} />
            </div>
          </SheetContent>
        </Sheet>
      </section>
    </OptimisticProgressContext.Provider>
  );
}
