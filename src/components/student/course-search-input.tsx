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
      <div className="relative flex min-h-[56px] items-center gap-3 rounded-3xl border border-[#2A2A3C] bg-[#1A1A24] px-4 py-2 shadow-[0_18px_40px_rgba(0,0,0,0.2)] transition-colors focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
        <Search
          className="size-5 shrink-0 text-gray-500"
          aria-hidden="true"
        />
        <Input
          id="course-search"
          type="text"
          inputMode="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search courses..."
          aria-label="Cari kursus berdasarkan judul"
          className="min-h-[44px] flex-1 border-0 bg-transparent px-2 text-sm text-white placeholder:text-gray-500 shadow-none focus-visible:ring-0"
        />
        {normalizeCourseSearchTerm(value) ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            aria-label="Hapus pencarian kursus"
            className="min-h-[44px] min-w-[44px] shrink-0 rounded-full text-gray-500 hover:bg-white/5 hover:text-white"
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </form>
  );
}
