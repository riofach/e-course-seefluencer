import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";

type StatCardProps = {
  title: string;
  value: number;
  icon?: ReactNode;
};

export function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <Card className="gap-0 border border-[#E5E7EB] bg-white py-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-[#E5E7EB] px-5 py-4">
        <CardTitle className="text-sm font-medium tracking-tight text-neutral-600">
          {title}
        </CardTitle>
        {icon ? <div className="text-neutral-500">{icon}</div> : null}
      </CardHeader>
      <CardContent className="px-5 py-4">
        <p className="text-3xl font-semibold tracking-tight text-neutral-950">
          {value.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <Card
          key={index}
          className="gap-0 border border-[#E5E7EB] bg-white py-0 shadow-sm"
        >
          <CardHeader className="border-b border-[#E5E7EB] px-5 py-4">
            <Skeleton
              className={cn("h-4 w-28 bg-neutral-200", {
                "w-32": index === 1,
                "w-36": index === 2,
              })}
            />
          </CardHeader>
          <CardContent className="px-5 py-4">
            <Skeleton className="h-9 w-20 bg-neutral-200" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
