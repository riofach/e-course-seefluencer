import Link from "next/link";
import { ArrowRight, BookOpenText, SearchX } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ThumbnailWithFallback } from "~/components/shared/thumbnail-with-fallback";
import type { PublishedCourseCatalogItem } from "~/server/courses/published-course-catalog";

type CourseCatalogProps = {
  courses: PublishedCourseCatalogItem[];
  searchQuery?: string;
};

export function CourseCatalog({ courses, searchQuery }: CourseCatalogProps) {
  if (courses.length === 0) {
    return <CourseCatalogEmptyState searchQuery={searchQuery} />;
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCatalogCard key={course.id} course={course} />
      ))}
    </div>
  );
}

function CourseCatalogCard({ course }: { course: PublishedCourseCatalogItem }) {
  const isFree = course.accessLabel === "Free";

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.12)] transition-all duration-200 hover:border-slate-300 focus-within:ring-2 focus-within:ring-indigo-500 dark:border-[#2A2A3C] dark:bg-[#1A1A24] dark:text-white dark:shadow-[0_18px_40px_rgba(0,0,0,0.24)] dark:hover:border-[#3A3A4C]">
      <div className="relative h-52 overflow-hidden rounded-t-3xl border-b border-slate-200/80 bg-slate-100 dark:border-[#2A2A3C] dark:bg-[#14141C]">
        <ThumbnailWithFallback
          src={course.thumbnailUrl}
          alt={course.title}
          className="h-full w-full object-cover"
          fallback={<CourseCatalogCardThumbnailFallback title={course.title} />}
          testId={`course-thumbnail-${course.id}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F14]/90 via-[#0F0F14]/25 to-transparent" />

        <span
          className={isFree
            ? "absolute right-4 top-4 inline-flex min-h-[44px] items-center rounded-full border border-teal-500/20 bg-teal-500/20 px-4 text-sm font-medium text-teal-400"
            : "absolute right-4 top-4 inline-flex min-h-[44px] items-center rounded-full border border-indigo-500/20 bg-indigo-500/20 px-4 text-sm font-medium text-indigo-400"}
        >
          {course.accessLabel}
        </span>
        <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/65 px-3 py-2 text-xs font-medium tracking-[0.18em] uppercase text-slate-700 backdrop-blur-sm dark:border-white/10 dark:bg-black/25 dark:text-slate-200">
          <BookOpenText className="size-4" aria-hidden="true" />
          Published
        </div>
      </div>

      <CardHeader className="space-y-3 pb-4">
        <div className="space-y-2">
          <CardTitle className="line-clamp-2 text-xl font-semibold leading-tight text-slate-900 dark:text-white">
            {course.title}
          </CardTitle>
          <CardDescription className="line-clamp-3 text-sm leading-6 tracking-tight text-slate-600 dark:text-gray-400">
            {course.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 font-medium text-slate-700 dark:border-white/10 dark:bg-[#14141C] dark:text-slate-200">
            {isFree ? "Open entry" : "Premium path"}
          </span>
          <span>Ready for discovery and detail preview</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          asChild
          className="min-h-[44px] w-full justify-between rounded-full bg-indigo-600 px-4 text-sm text-white hover:bg-violet-500 focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Link href={`/courses/${course.slug}`} aria-label={`View course details for ${course.title}`}>
            View course details
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function CourseCatalogCardThumbnailFallback({ title }: { title: string }) {
  return (
    <div className="h-full w-full bg-gradient-to-tr from-[#FF6B6B]/20 via-[#F8FAFC] to-[#1ABC9C]/20 dark:from-[#9B59B6]/30 dark:via-[#151520] dark:to-[#1ABC9C]/10">
      <span className="sr-only">Thumbnail unavailable for {title}</span>
    </div>
  );
}

function CourseCatalogEmptyState({ searchQuery }: { searchQuery?: string }) {
  const isSearchEmpty = Boolean(searchQuery);

  return (
    <Card className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white text-slate-900 shadow-[0_18px_40px_rgba(15,23,42,0.12)] dark:border-[#2A2A3C] dark:bg-[#1A1A24] dark:text-white dark:shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
      <div
        aria-hidden="true"
        className="absolute -top-12 left-1/2 size-36 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,_rgba(99,102,241,0.35),_transparent_70%)] blur-3xl"
      />

      <CardHeader className="relative items-center px-6 pt-10 text-center sm:px-10">
        <div
          aria-hidden="true"
          className="mb-4 flex size-24 items-center justify-center rounded-[28px] border border-slate-200/80 bg-[linear-gradient(135deg,_rgba(255,107,107,0.16)_0%,_rgba(155,89,182,0.18)_52%,_rgba(26,188,156,0.16)_100%)] shadow-sm dark:border-[#2A2A3C]"
        >
          <div className="flex size-14 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm dark:border-[#2A2A3C] dark:bg-[#14141C]">
            <SearchX className="size-7 text-indigo-300" />
          </div>
        </div>

        <div className="space-y-3">
          <CardTitle className="text-2xl tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            {isSearchEmpty ? "No courses found" : "No courses available yet"}
          </CardTitle>
          <CardDescription className="mx-auto max-w-md text-center text-sm leading-7 tracking-tight text-slate-600 dark:text-slate-300 sm:text-base">
            {isSearchEmpty ? (
              <>
                No published courses match &quot;
                <strong>{searchQuery}</strong>&quot;.
                <br className="hidden sm:block" />
                Try a different keyword or clear the search to browse everything.
              </>
            ) : (
              <>
                Published courses will appear here as soon as they are ready.
                <br className="hidden sm:block" />
                In the meantime, head back to the homepage or pricing surface for the next step.
              </>
            )}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="relative flex justify-center px-6 pb-10 sm:px-10">
        <div className="flex flex-col items-center gap-3">
          {isSearchEmpty ? (
            <Button asChild className="min-h-[44px] rounded-full bg-indigo-600 px-5 text-white hover:bg-indigo-500">
              <Link href="/courses">Clear search</Link>
            </Button>
          ) : (
            <>
              <Button asChild className="min-h-[44px] rounded-full bg-indigo-600 px-5 text-white hover:bg-indigo-500">
                <Link href="/">Back to homepage</Link>
              </Button>
              <p className="text-center text-sm leading-6 text-slate-500 dark:text-slate-400">
                This surface stays intentionally non-empty so visitors always have a clear next action.
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
