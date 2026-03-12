import Link from "next/link";
import { CirclePlay, FileText, HelpCircle, Lock } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import type { CourseDetailItem } from "~/server/courses/course-detail";

type CourseSyllabusProps = {
  courseSlug: CourseDetailItem["slug"];
  chapters: CourseDetailItem["chapters"];
};

function toLessonTypeLabel(type: string) {
  switch (type.toLowerCase()) {
    case "video":
      return "Video";
    case "text":
      return "Text";
    case "quiz":
      return "Quiz";
    default:
      return type;
  }
}

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

export function CourseSyllabus({ courseSlug, chapters }: CourseSyllabusProps) {
  const defaultOpenItems = chapters.map((chapter) => `chapter-${chapter.id}`);
  const hasPremiumLessons = chapters.some((chapter) =>
    chapter.lessons.some((lesson) => !lesson.isFree),
  );

  return (
    <section className="rounded-[28px] border border-slate-200/80 bg-white/80 p-6 text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-[#2A2A3C] dark:bg-[#1A1A24] dark:text-white dark:shadow-none sm:p-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase dark:text-slate-400">
          Syllabus preview
        </p>
        <h2 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Explore the full learning path before you start.
        </h2>
        <p className="max-w-3xl text-sm leading-7 tracking-[-0.02em] text-slate-600 dark:text-slate-300 sm:text-base">
          Scan the chapter structure, lesson types, and premium lock states without hiding the curriculum. Visitors can see the roadmap,
          while enrolled learners can jump directly into the lesson flow.
        </p>
      </div>

      <div className="mt-6">
        {chapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 px-4 py-12 text-center dark:border-[#2A2A3C]">
            <p className="text-sm font-medium tracking-[-0.02em] text-slate-500 dark:text-slate-400">
              Syllabus kursus belum tersedia.
            </p>
          </div>
        ) : (
          <Accordion
            type="multiple"
            defaultValue={defaultOpenItems}
            className="space-y-4"
          >
            {chapters.map((chapter) => (
              <AccordionItem
                key={chapter.id}
                value={`chapter-${chapter.id}`}
                className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/85 dark:border-[#2A2A3C] dark:bg-[#14141C]"
              >
                <AccordionTrigger className="rounded-[24px] px-5 py-4 hover:no-underline focus-visible:ring-2 focus-visible:ring-indigo-500">
                  <div className="flex w-full flex-col gap-2 text-left sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
                        Chapter {chapter.order}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                        {chapter.title}
                      </h3>
                    </div>
                    <Badge className="w-fit border border-slate-200 bg-slate-100 px-3 py-1 text-slate-600 dark:border-[#2A2A3C] dark:bg-white/5 dark:text-slate-300">
                      {chapter.lessons.length} lessons
                    </Badge>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-5 pb-5">
                  <ul
                    className="space-y-3"
                    aria-label={`Lessons untuk ${chapter.title}`}
                  >
                    {chapter.lessons.map((lesson) => {
                      const LessonTypeIcon = getLessonTypeIcon(lesson.type);

                      return (
                        <li key={lesson.id}>
                          <Link
                            href={`/courses/${courseSlug}/lessons/${lesson.id}`}
                            className="block rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                          >
                            <div className="flex min-h-11 items-center gap-3 rounded-[20px] border border-slate-200/80 bg-white px-4 py-3 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-[#2A2A3C] dark:bg-[#1A1A24] dark:hover:border-[#3A3A4C] dark:hover:bg-white/5">
                              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-300">
                                <LessonTypeIcon className="size-4" aria-hidden="true" />
                              </div>

                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-xs font-medium tracking-[0.18em] text-slate-500 uppercase">
                                    Lesson {lesson.order}
                                  </p>
                                  <Badge className="border border-slate-200 bg-slate-100 text-slate-600 dark:border-[#2A2A3C] dark:bg-white/5 dark:text-slate-300">
                                    {toLessonTypeLabel(lesson.type)}
                                  </Badge>
                                  {lesson.isFree ? (
                                    <Badge className="border border-teal-500/20 bg-teal-500/20 text-teal-400">
                                      Free
                                    </Badge>
                                  ) : (
                                    <Badge className="border border-indigo-500/20 bg-indigo-500/20 text-indigo-400">
                                      <Lock className="size-3" aria-hidden="true" />
                                      Premium
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm font-medium tracking-[-0.02em] break-words text-slate-800 dark:text-slate-100">
                                  {lesson.title}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>

                  {chapter.lessons.some((lesson) => !lesson.isFree) ? (
                    <div className="mt-4 rounded-[20px] border border-indigo-500/20 bg-indigo-500/10 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm leading-6 tracking-[-0.02em] text-indigo-100">
                          Unlock with Premium — subscribe for full access to every lesson in this chapter.
                        </p>
                        <Button asChild className="min-h-[44px] rounded-full bg-indigo-600 text-white hover:bg-violet-500">
                          <Link href="/pricing">Unlock with Premium</Link>
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      {hasPremiumLessons ? (
        <div className="mt-6 rounded-[24px] border border-slate-200/80 bg-white/85 p-5 shadow-sm dark:border-[#2A2A3C] dark:bg-[#14141C] dark:shadow-none">
          <p className="text-sm font-semibold tracking-[-0.02em] text-slate-900 dark:text-white">
            Premium lessons stay visible in the syllabus.
          </p>
          <p className="mt-2 text-sm leading-6 tracking-[-0.02em] text-slate-500 dark:text-slate-400">
            This preserves trust by showing the full curriculum roadmap while still making subscription value obvious.
          </p>
        </div>
      ) : null}
    </section>
  );
}

export { toLessonTypeLabel };
