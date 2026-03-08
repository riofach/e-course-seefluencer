import { Skeleton } from "~/components/ui/skeleton";

export function CourseDetailSkeleton() {
  return (
    <div className="space-y-8" data-testid="course-detail-skeleton">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
        <div className="order-2 space-y-4 lg:order-1">
          <Skeleton className="h-6 w-20 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full max-w-2xl" />
            <Skeleton className="h-5 w-full max-w-3xl" />
            <Skeleton className="h-5 w-5/6 max-w-2xl" />
          </div>
          <Skeleton className="h-11 w-40" />
        </div>

        <Skeleton className="order-1 min-h-64 rounded-3xl lg:order-2 sm:min-h-80" />
      </section>

      <section className="space-y-4 rounded-xl border p-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-72" />

        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, chapterIndex) => (
            <div key={chapterIndex} className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-7 w-56" />
              <div className="space-y-3 border-l pl-4 sm:pl-6">
                {Array.from({ length: 3 }).map((_, lessonIndex) => (
                  <Skeleton
                    key={`${chapterIndex}-${lessonIndex}`}
                    className="h-14 w-full rounded-xl"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
