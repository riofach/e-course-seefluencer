import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { render, screen } from "@testing-library/react";
import React from "react";
import { test, vi } from "vitest";

import { CourseSidebarNav } from "./course-sidebar-nav";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

window.HTMLElement.prototype.scrollIntoView = vi.fn();

test("course sidebar nav renders isFree badge for free lessons and Pro badge for premium lessons", () => {
  render(
    <CourseSidebarNav
      courseSlug="test-course"
      chapters={[
        {
          id: 1,
          title: "Chapter 1",
          order: 1,
          lessons: [
            {
              id: 1,
              title: "Free Lesson",
              type: "video",
              order: 1,
              isFree: true,
            },
            {
              id: 2,
              title: "Premium Lesson",
              type: "video",
              order: 2,
              isFree: false,
            },
          ],
        },
      ]}
      activeLessonId={1}
      completedLessonIds={[]}
      progressPercent={0}
    />,
  );

  assert.ok(screen.getByText("Free"));
  assert.ok(screen.getByText("Pro"));
  assert.ok(document.querySelector(".lucide-lock"));
});

test("course sidebar nav uses isFree from SidebarLesson type", () => {
  const sharedFilePath = resolve(
    process.cwd(),
    "src/server/courses/lesson-navigation.shared.ts",
  );
  const sharedContents = readFileSync(sharedFilePath, "utf8");

  assert.match(sharedContents, /isFree/);
});

test("lesson navigation DB query selects isFree field", () => {
  const navFilePath = resolve(
    process.cwd(),
    "src/server/courses/lesson-navigation.ts",
  );
  const navContents = readFileSync(navFilePath, "utf8");

  assert.match(navContents, /isFree/);
});

test("course sidebar nav keeps premium active state while providing light defaults and dark overrides", () => {
  const filePath = resolve(
    process.cwd(),
    "src/components/student/course-sidebar-nav.tsx",
  );
  const contents = readFileSync(filePath, "utf8");

  assert.match(contents, /border-slate-200 bg-white/);
  assert.match(contents, /dark:border-\[#2A2A3C\] dark:bg-\[#1A1A24\]/);
  assert.match(contents, /border-indigo-500 bg-indigo-50/);
  assert.match(contents, /dark:border-\[#6366F1\] dark:bg-\[#6366F1\]\/10/);
  assert.match(contents, /ring-indigo-500\/50/);
});
