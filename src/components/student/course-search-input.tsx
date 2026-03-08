"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

import {
  buildCourseSearchHref,
  normalizeCourseSearchTerm,
} from "./course-search-input.helpers";

type CourseSearchInputProps = {
  defaultValue?: string;
  debounceMs?: number;
};

export function CourseSearchInput({
  defaultValue,
  debounceMs = 400,
}: CourseSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";

  const [value, setValue] = useState(defaultValue ?? currentQuery);
  const [lastQuery, setLastQuery] = useState(currentQuery);

  useEffect(() => {
    if (currentQuery !== lastQuery) {
      setValue(currentQuery);
      setLastQuery(currentQuery);
    }
  }, [currentQuery, lastQuery]);

  useEffect(() => {
    const normalizedValue = normalizeCourseSearchTerm(value);

    if (
      (normalizedValue === undefined && !currentQuery) ||
      normalizedValue === currentQuery
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const href = buildCourseSearchHref(
        pathname,
        value,
        searchParams.toString(),
      );
      router.replace(href, { scroll: false });
    }, debounceMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [debounceMs, pathname, router, searchParams, value, currentQuery]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const href = buildCourseSearchHref(
      pathname,
      value,
      searchParams.toString(),
    );
    router.replace(href, { scroll: false });
  };

  const handleClear = () => {
    setValue("");

    const href = buildCourseSearchHref(
      pathname,
      undefined,
      searchParams.toString(),
    );
    router.replace(href, { scroll: false });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <label htmlFor="course-search" className="sr-only">
        Cari kursus berdasarkan judul
      </label>
      <div className="border-border/70 bg-card/95 focus-within:border-primary/50 focus-within:ring-primary/10 relative flex min-h-[56px] items-center gap-3 rounded-2xl border px-4 py-2 shadow-sm transition-colors focus-within:ring-2">
        <Search
          className="text-muted-foreground size-5 shrink-0"
          aria-hidden="true"
        />
        <Input
          id="course-search"
          type="text"
          inputMode="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Cari judul kursus..."
          aria-label="Cari kursus berdasarkan judul"
          className="min-h-[44px] flex-1 border-0 bg-transparent px-2 text-sm shadow-none focus-visible:ring-0"
        />
        {normalizeCourseSearchTerm(value) ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            aria-label="Hapus pencarian kursus"
            className="text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] shrink-0 rounded-full"
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </form>
  );
}
