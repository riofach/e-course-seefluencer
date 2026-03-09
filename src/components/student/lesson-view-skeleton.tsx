import { Skeleton } from "~/components/ui/skeleton";

export function LessonViewSkeleton() {
  return (
    <section className="bg-background text-foreground">
      <div className="container mx-auto min-h-[calc(100vh-3.5rem)] px-4 py-8 sm:py-10 lg:py-14">
        <div className="flex items-start gap-6">
          <aside className="hidden w-[280px] shrink-0 rounded-xl border lg:block">
            <div className="space-y-4 p-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2 w-full" />
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            </div>
          </aside>

          <div className="flex-1 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-10 w-full max-w-2xl" />
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>

            <Skeleton className="aspect-video w-full rounded-2xl" />

            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-[92%]" />
              <Skeleton className="h-5 w-[88%]" />
              <Skeleton className="h-5 w-[74%]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
