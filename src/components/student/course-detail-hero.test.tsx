import assert from "node:assert/strict";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, test } from "vitest";

import {
  CourseDetailHero,
  type CourseDetailHeroProgressData,
} from "./course-detail-hero";

afterEach(() => {
  cleanup();
});

const baseCourse = {
  title: "Advanced Next.js",
  description: "Production patterns for App Router.",
  thumbnailUrl: "https://example.com/nextjs.png",
  isFree: false,
  slug: "advanced-nextjs",
  chapters: [
    {
      id: 1,
      title: "Chapter 1",
      order: 1,
      lessons: [
        {
          id: 10,
          title: "Lesson 1",
          type: "video",
          order: 1,
          isFree: false,
        },
      ],
    },
  ],
};

const baseCta = {
  label: "Lihat detail",
  href: "/pricing",
  helperText: "Lanjutkan ke pricing untuk akses penuh.",
};

const baseProgress: CourseDetailHeroProgressData = {
  progressPercent: 50,
  completedCount: 1,
  totalLessons: 2,
};

test("renders hero placeholder when no thumbnail is provided", () => {
  render(
    <CourseDetailHero
      course={{ ...baseCourse, thumbnailUrl: null }}
      cta={baseCta}
      progressData={baseProgress}
    />,
  );

  assert.ok(screen.getByText(/course preview/i));
  assert.ok(
    screen.getByText(/premium-looking landing hero even before the thumbnail is uploaded/i),
  );
});

test("renders hero placeholder when thumbnail loading fails at runtime", () => {
  render(
    <CourseDetailHero
      course={baseCourse}
      cta={baseCta}
      progressData={baseProgress}
    />,
  );

  fireEvent.error(screen.getByRole("img", { name: /advanced next\.js/i }));

  assert.ok(
    screen.getByText(/visual placeholder keeps the page polished while content assets are still being prepared/i),
  );
});
