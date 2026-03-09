import Link from "next/link";

import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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

export function CourseSyllabus({ courseSlug, chapters }: CourseSyllabusProps) {
  return (
    <Card className="border-border/70 bg-card/95">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Syllabus</CardTitle>
        <CardDescription>
          Jelajahi seluruh chapter dan lesson yang tersedia pada kursus ini.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {chapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-12 text-center">
            <p className="text-muted-foreground text-sm font-medium">
              Syllabus kursus belum tersedia.
            </p>
          </div>
        ) : (
          <ul className="space-y-6" aria-label="Daftar chapter kursus">
            {chapters.map((chapter) => (
              <li key={chapter.id}>
                <div className="space-y-3">
                  <div>
                    <p className="text-primary text-sm font-semibold tracking-wide">
                      Chapter {chapter.order}
                    </p>
                    <h2 className="text-lg font-semibold">{chapter.title}</h2>
                  </div>

                  <ul
                    className="border-border/70 space-y-3 border-l pl-4 sm:pl-6"
                    aria-label={`Lessons untuk ${chapter.title}`}
                  >
                    {chapter.lessons.map((lesson) => (
                      <li key={lesson.id}>
                        <Link
                          href={`/courses/${courseSlug}/lessons/${lesson.id}`}
                          className="focus-visible:ring-ring block rounded-xl focus-visible:outline-none focus-visible:ring-[3px]"
                        >
                        <div className="hover:bg-accent/40 flex min-h-11 items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors">
                          <div className="min-w-0 space-y-1">
                            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                              Lesson {lesson.order}
                            </p>
                            <p className="font-medium break-words">
                              {lesson.title}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <Badge variant="outline">
                              {toLessonTypeLabel(lesson.type)}
                            </Badge>
                            {lesson.isFree ? (
                              <Badge variant="secondary">Free</Badge>
                            ) : null}
                          </div>
                        </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export { toLessonTypeLabel };
