import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function PricingPageSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <Card key={index} className="rounded-[28px] border-[#2A2A3C] bg-[#1A1A24] text-white">
          <CardHeader className="space-y-3">
            <Skeleton className="h-8 w-40 bg-white/10" />
            <Skeleton className="h-4 w-full bg-white/10" />
            <Skeleton className="h-4 w-4/5 bg-white/10" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-12 w-40 bg-white/10" />
            <Skeleton className="h-24 w-full rounded-[24px] bg-white/10" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-11 w-full rounded-full bg-white/10" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
