"use client";

import { PanelLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { CourseSidebarNav } from "~/components/student/course-sidebar-nav";
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
  progressPercent,
}: LessonLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarProps = useMemo(
    () => ({
      courseSlug,
      chapters,
      activeLessonId,
      completedLessonIds,
      progressPercent,
      onLessonSelected: () => setIsSidebarOpen(false),
    }),
    [activeLessonId, chapters, completedLessonIds, courseSlug, progressPercent],
  );

  return (
    <section className="bg-background text-foreground min-h-[calc(100vh-3.5rem)]">
      <div className="container mx-auto px-4 py-8 sm:py-10 lg:py-14">
        <div className="mb-4 lg:hidden">
          <Button
            type="button"
            variant="outline"
            className="sticky top-20 z-20"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <PanelLeft className="size-4" />
            Sidebar
          </Button>
        </div>

        <div className="flex items-start gap-6">
          <aside className="sticky top-20 hidden h-[calc(100vh-7rem)] w-[280px] shrink-0 overflow-hidden rounded-xl border lg:block">
            <CourseSidebarNav {...sidebarProps} />
          </aside>

          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-[280px] p-0 sm:max-w-[280px]">
          <SheetHeader className="border-b px-4 py-4 text-left">
            <SheetTitle>Course navigation</SheetTitle>
            <SheetDescription>
              Pilih chapter dan lesson untuk lanjut belajar.
            </SheetDescription>
          </SheetHeader>

          <div className="h-[calc(100%-4.5rem)]">
            <CourseSidebarNav {...sidebarProps} />
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
