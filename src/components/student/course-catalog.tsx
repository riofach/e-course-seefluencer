import Link from "next/link";
import { ArrowRight, BookOpenText } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => (
        <CourseCatalogCard key={course.id} course={course} />
      ))}
    </div>
  );
}

function CourseCatalogCard({ course }: { course: PublishedCourseCatalogItem }) {
  return (
    <Card className="border-border/70 bg-card/95 hover:border-primary/40 flex h-full flex-col overflow-hidden transition-colors">
      <div className="from-primary/12 via-primary/6 to-background relative min-h-44 overflow-hidden border-b bg-gradient-to-br p-6">
        {course.thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="from-background/90 to-background/20 absolute inset-0 bg-gradient-to-t" />

        <span className="bg-background/90 text-foreground relative z-10 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-4 text-sm font-medium shadow-sm">
          {course.accessLabel}
        </span>
        <div className="bg-background/80 text-primary absolute right-4 bottom-4 z-10 rounded-full border p-3 shadow-sm">
          <BookOpenText className="size-6" aria-hidden="true" />
        </div>
      </div>

      <CardHeader className="space-y-3">
        <div className="space-y-2">
          <CardTitle className="line-clamp-2 text-xl leading-tight">
            {course.title}
          </CardTitle>
          <CardDescription className="line-clamp-3 text-sm leading-6">
            {course.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <span className="bg-primary/10 text-primary rounded-full px-3 py-1 font-medium">
            Katalog publik
          </span>
          <span>Siap untuk pencarian & detail kursus</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          asChild
          className="min-h-11 w-full justify-between px-4 text-sm"
        >
          <Link href={`/courses/${course.slug}`}>
            Lihat detail kursus
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function CourseCatalogEmptyState({ searchQuery }: { searchQuery?: string }) {
  return (
    <Card className="border-border/70 from-card via-card to-primary/5 relative mx-auto w-full max-w-3xl overflow-hidden border-dashed bg-gradient-to-br shadow-sm">
      <div
        aria-hidden="true"
        className="bg-primary/10 absolute -top-12 left-1/2 size-36 -translate-x-1/2 rounded-full blur-3xl"
      />

      <CardHeader className="relative items-center px-6 pt-10 text-center sm:px-10">
        <div
          aria-hidden="true"
          className="from-primary/18 via-primary/8 to-background mb-4 flex size-24 items-center justify-center rounded-[28px] border bg-gradient-to-br shadow-sm"
        >
          <div className="bg-background/85 flex size-14 items-center justify-center rounded-2xl border shadow-sm">
            <BookOpenText className="text-primary size-7" />
          </div>
        </div>

        <div className="space-y-3">
          <CardTitle className="text-2xl tracking-tight sm:text-3xl">
            {searchQuery ? "Kursus tidak ditemukan" : "Belum ada kursus publik"}
          </CardTitle>
          <CardDescription className="text-muted-foreground mx-auto max-w-md text-center text-sm leading-7 sm:text-base">
            {searchQuery ? (
              <>
                Tidak ada kursus publik yang cocok dengan pencarian &quot;
                <strong>{searchQuery}</strong>&quot;.
                <br className="hidden sm:block" />
                Coba gunakan kata kunci lain.
              </>
            ) : (
              <>
                Kursus yang sudah dipublikasikan akan muncul di sini.
                <br className="hidden sm:block" />
                Sementara itu, kamu bisa kembali ke beranda untuk melihat update
                terbaru.
              </>
            )}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="relative flex justify-center px-6 pb-10 sm:px-10">
        <div className="flex flex-col items-center gap-3">
          {searchQuery ? (
            <Button asChild variant="outline" className="min-h-11 px-5">
              <Link href="/courses">Lihat semua kursus</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" className="min-h-11 px-5">
                <Link href="/">Jelajahi beranda</Link>
              </Button>
              <p className="text-muted-foreground text-center text-sm leading-6">
                Jangan khawatir — materi baru akan tampil otomatis setelah live.
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
