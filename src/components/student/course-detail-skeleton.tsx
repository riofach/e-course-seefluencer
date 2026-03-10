import { Skeleton } from "~/components/ui/skeleton";

export function CourseDetailSkeleton() {
  return (
    <div className="space-y-8" data-testid="course-detail-skeleton">
      <section className="rounded-[32px] border border-[#2A2A3C] bg-[#1A1A24] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
          <div className="order-2 space-y-4 lg:order-1">
            <Skeleton className="h-6 w-28 rounded-full bg-white/10" />
            <div className="space-y-3">
              <Skeleton className="h-14 w-full max-w-2xl bg-white/10" />
              <Skeleton className="h-5 w-full max-w-3xl bg-white/10" />
              <Skeleton className="h-5 w-5/6 max-w-2xl bg-white/10" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-11 w-36 rounded-full bg-white/10" />
              <Skeleton className="h-11 w-56 rounded-full bg-white/10" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-[24px] bg-white/10" />
              ))}
            </div>
          </div>

          <Skeleton className="order-1 min-h-[280px] rounded-[28px] bg-white/10 lg:order-2 lg:min-h-[420px]" />
        </div>
      </section>

      <section className="space-y-4 rounded-[28px] border border-[#2A2A3C] bg-[#1A1A24] p-6">
        <Skeleton className="h-8 w-52 bg-white/10" />
        <Skeleton className="h-5 w-80 bg-white/10" />

        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, chapterIndex) => (
            <div key={chapterIndex} className="space-y-3">
              <Skeleton className="h-16 w-full rounded-[24px] bg-white/10" />
              <div className="space-y-3 pl-2">
                {Array.from({ length: 3 }).map((_, lessonIndex) => (
                  <Skeleton
                    key={`${chapterIndex}-${lessonIndex}`}
                    className="h-14 w-full rounded-[20px] bg-white/10"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-[320px] rounded-[28px] border border-[#2A2A3C] bg-[#1A1A24]" />
        <Skeleton className="h-[320px] rounded-[28px] border border-[#2A2A3C] bg-[#1A1A24]" />
      </section>
    </div>
  );
}
