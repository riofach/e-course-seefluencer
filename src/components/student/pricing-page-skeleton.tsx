import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function PricingPageSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <Card key={index} className="rounded-2xl">
          <CardHeader className="space-y-3">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
