"use client";

import { useEffect, useMemo, useRef } from "react";
import { CheckCircle2, CirclePlay, FileText, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils";
import {
  toLessonTypeLabel,
  type SidebarChapter,
} from "~/server/courses/lesson-navigation.shared";

type CourseSidebarNavProps = {
  courseSlug: string;
  chapters: SidebarChapter[];
  activeLessonId: number;
  completedLessonIds: number[];
  progressPercent: number;
  onLessonSelected?: () => void;
};

function getLessonTypeIcon(type: string) {
  switch (type.toLowerCase()) {
    case "video":
      return CirclePlay;
    case "text":
      return FileText;
    case "quiz":
      return HelpCircle;
    default:
      return FileText;
  }
}

export function CourseSidebarNav({
  courseSlug,
  chapters,
  activeLessonId,
  completedLessonIds,
  progressPercent,
  onLessonSelected,
}: CourseSidebarNavProps) {
  const router = useRouter();
  const activeLessonRef = useRef<HTMLButtonElement | null>(null);
  const defaultOpenItems = useMemo(
    () => chapters.map((chapter) => `chapter-${chapter.id}`),
    [chapters],
  );
  const completedLessonIdsSet = useMemo(
    () => new Set(completedLessonIds),
    [completedLessonIds],
  );

  useEffect(() => {
    activeLessonRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [activeLessonId]);

  return (
    <nav
      aria-label="Course sidebar navigation"
      className="bg-background flex h-full w-full flex-col border-r"
    >
      <div className="border-b px-4 py-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">Progress belajar</p>
          <span className="text-muted-foreground text-sm font-medium">
            {progressPercent}% complete
          </span>
        </div>
        <Progress
          value={progressPercent}
          aria-label={`${progressPercent}% complete`}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        <Accordion
          type="multiple"
          defaultValue={defaultOpenItems}
          className="w-full"
        >
          {chapters.map((chapter) => (
            <AccordionItem key={chapter.id} value={`chapter-${chapter.id}`}>
              <AccordionTrigger className="rounded-lg px-2 text-sm hover:no-underline focus-visible:ring-[3px]">
                <div className="space-y-1 text-left">
                  <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    Chapter {chapter.order}
                  </p>
                  <p className="text-foreground font-medium">{chapter.title}</p>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pb-2">
                <ul
                  className="space-y-2"
                  aria-label={`Lessons untuk ${chapter.title}`}
                >
                  {chapter.lessons.map((lesson) => {
                    const isActive = lesson.id === activeLessonId;
                    const isCompleted = completedLessonIdsSet.has(lesson.id);
                    const LessonTypeIcon = getLessonTypeIcon(lesson.type);

                    return (
                      <li key={lesson.id}>
                        <button
                          ref={(el) => {
                            if (isActive) activeLessonRef.current = el;
                          }}
                          type="button"
                          onClick={() => {
                            onLessonSelected?.();
                            router.push(
                              `/courses/${courseSlug}/lessons/${lesson.id}`,
                            );
                          }}
                          className={cn(
                            "focus-visible:ring-ring flex min-h-11 w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors focus-visible:ring-[3px] focus-visible:outline-none",
                            isActive
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "hover:bg-accent/40 bg-background",
                          )}
                          aria-current={isActive ? "page" : undefined}
                        >
                          <LessonTypeIcon className="text-muted-foreground size-4 shrink-0" />

                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
                              Lesson {lesson.order}
                            </p>
                            <p className="text-foreground text-sm font-medium break-words">
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {toLessonTypeLabel(lesson.type)}
                              </Badge>
                            </div>
                          </div>

                          {isCompleted ? (
                            <CheckCircle2
                              className="size-4 shrink-0 text-emerald-600"
                              aria-label="Completed lesson"
                            />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </nav>
  );
}
