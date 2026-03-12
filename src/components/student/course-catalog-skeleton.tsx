import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function CourseCatalogSkeleton() {
  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-200/80 bg-white/90 px-6 py-10 dark:border-[#2A2A3C] dark:bg-[#14141C] sm:px-10 sm:py-12 lg:px-12 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div className="space-y-4">
            <Skeleton className="h-10 w-48 rounded-full bg-white/10" />
            <Skeleton className="h-12 w-full max-w-2xl bg-white/10" />
            <Skeleton className="h-6 w-full max-w-xl bg-white/10" />
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-10 w-40 rounded-full bg-white/10" />
              <Skeleton className="h-10 w-40 rounded-full bg-white/10" />
              <Skeleton className="h-10 w-44 rounded-full bg-white/10" />
            </div>
          </div>
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 dark:border-[#2A2A3C] dark:bg-[#1A1A24]">
            <div className="space-y-3">
              <Skeleton className="h-4 w-28 bg-white/10" />
              <Skeleton className="h-8 w-48 bg-white/10" />
              <Skeleton className="h-20 w-full rounded-2xl bg-white/10" />
              <Skeleton className="h-20 w-full rounded-2xl bg-white/10" />
              <Skeleton className="h-20 w-full rounded-2xl bg-white/10" />
            </div>
          </div>
        </div>
      </div>

      <Skeleton className="h-14 w-full max-w-3xl rounded-3xl bg-slate-200 dark:bg-[#1A1A24]" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Card
            key={index}
            className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white dark:border-[#2A2A3C] dark:bg-[#1A1A24]"
          >
            <div className="h-52 border-b border-slate-200/80 p-4 dark:border-[#2A2A3C]">
              <Skeleton className="h-full w-full rounded-[24px] bg-white/10" />
            </div>
            <CardHeader className="space-y-3">
              <Skeleton className="h-7 w-3/4 bg-white/10" />
              <Skeleton className="h-4 w-full bg-white/10" />
              <Skeleton className="h-4 w-5/6 bg-white/10" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-36 rounded-full bg-white/10" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-11 w-full rounded-full bg-white/10" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
