import assert from "node:assert/strict";

import { render, screen } from "@testing-library/react";
import { test, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { noStoreMock } = vi.hoisted(() => ({
  noStoreMock: vi.fn(),
}));

vi.mock("next/cache", async () => {
  const actual = await vi.importActual<typeof import("next/cache")>("next/cache");

  return {
    ...actual,
    unstable_noStore: noStoreMock,
  };
});

vi.mock("~/components/student/course-search-input", () => ({
  CourseSearchInput: ({ defaultValue }: { defaultValue?: string }) => (
    <div data-testid="course-search-input">default:{defaultValue ?? ""}</div>
  ),
}));

vi.mock("~/components/student/course-catalog", () => ({
  CourseCatalog: (props: Record<string, unknown>) => (
    <div data-testid="course-catalog">{JSON.stringify(props)}</div>
  ),
}));

import CoursesPage, { revalidate } from "./page";
import * as catalogCache from "~/server/courses/published-course-catalog-cache";
import * as courseSearch from "~/server/courses/search-published-courses";

test("courses page preserves ISR and renders premium public hero for guests", async () => {
  noStoreMock.mockReset();

  vi.spyOn(catalogCache, "getPublishedCourseCatalog").mockResolvedValue([
    {
      id: 1,
      title: "React Foundations",
      description: "Build strong fundamentals.",
      slug: "react-foundations",
      thumbnailUrl: null,
      accessLabel: "Free",
    },
  ]);
  const searchSpy = vi.spyOn(courseSearch, "searchPublishedCourses");

  const PageComponent = await CoursesPage({
    searchParams: Promise.resolve({}),
  });

  render(PageComponent);

  assert.equal(revalidate, 300);
  assert.equal(searchSpy.mock.calls.length, 0);
  assert.equal(noStoreMock.mock.calls.length, 0);
  assert.ok(screen.getByText(/browse courses/i));
  assert.ok(screen.getByText(/public catalog/i));
  assert.ok(screen.getByTestId("course-catalog").textContent?.includes('"accessLabel":"Free"'));
});

test("courses page uses search flow without breaking URL-param discovery", async () => {
  noStoreMock.mockReset();

  vi.spyOn(catalogCache, "getPublishedCourseCatalog").mockResolvedValue([]);
  const searchSpy = vi.spyOn(courseSearch, "searchPublishedCourses").mockResolvedValue([
    {
      id: 2,
      title: "Advanced Next.js",
      description: "Ship production-grade apps.",
      slug: "advanced-nextjs",
      thumbnailUrl: null,
      accessLabel: "Premium",
    },
  ]);

  const PageComponent = await CoursesPage({
    searchParams: Promise.resolve({ q: "next" }),
  });

  render(PageComponent);

  assert.equal(searchSpy.mock.calls[0]?.[0], "next");
  assert.equal(noStoreMock.mock.calls.length, 1);
  assert.ok(screen.getByTestId("course-search-input").textContent?.includes("default:next"));
  assert.ok(screen.getByTestId("course-catalog").textContent?.includes('"searchQuery":"next"'));
});
