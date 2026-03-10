import assert from "node:assert/strict";

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("~/components/student/course-detail-hero", () => ({
  CourseDetailHero: ({ cta }: { cta: { label: string; href: string } }) => (
    <div data-testid="course-detail-hero">
      <span>{cta.label}</span>
      <span>{cta.href}</span>
    </div>
  ),
}));

vi.mock("~/components/student/course-syllabus", () => ({
  CourseSyllabus: ({ courseSlug }: { courseSlug: string }) => (
    <div data-testid="course-syllabus">{courseSlug}</div>
  ),
}));

vi.mock("~/components/student/course-outcomes", () => ({
  CourseOutcomes: ({ title }: { title: string }) => (
    <div data-testid="course-outcomes">{title}</div>
  ),
}));

vi.mock("~/server/auth", () => ({
  getServerAuthSession: vi.fn(),
}));

vi.mock("~/server/courses/course-detail", () => ({
  getCourseDetailBySlug: vi.fn(),
}));

vi.mock("~/server/courses/lesson-navigation", () => ({
  getCourseSidebarData: vi.fn(),
}));

vi.mock("~/server/queries/subscriptions", () => ({
  getUserActiveSubscription: vi.fn(),
}));

vi.mock("./page.helpers", () => ({
  resolveCoursePageData: vi.fn(),
  resolveCourseLandingCta: vi.fn((options: { course: { slug: string; isFree: boolean }; isAuthenticated: boolean }) => ({
    label: options.course.isFree ? "Start Learning" : "Get Premium Access",
    href: options.course.isFree
      ? options.isAuthenticated
        ? `/courses/${options.course.slug}/lessons/101`
        : `/login?callbackUrl=${encodeURIComponent(`/courses/${options.course.slug}`)}`
      : "/pricing",
    helperText: "helper",
  })),
  getCourseOutcomeItems: vi.fn(() => ["Outcome 1", "Outcome 2"]),
}));

import CourseDetailPage from "./page";
import { getServerAuthSession } from "~/server/auth";
import { getCourseSidebarData } from "~/server/courses/lesson-navigation";
import { getUserActiveSubscription } from "~/server/queries/subscriptions";
import { resolveCoursePageData } from "./page.helpers";

const sampleCourse = {
  id: 1,
  title: "React Foundations",
  description: "Build strong React instincts.",
  thumbnailUrl: null,
  isFree: true,
  slug: "react-foundations",
  chapters: [
    {
      id: 10,
      title: "Getting Started",
      order: 1,
      lessons: [
        {
          id: 101,
          title: "Welcome",
          type: "video",
          order: 1,
          isFree: true,
        },
      ],
    },
  ],
};

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

test("course detail page stays public for guests and renders persuasive sections", async () => {
  vi.mocked(getServerAuthSession).mockResolvedValue(null);
  vi.mocked(resolveCoursePageData).mockResolvedValue(sampleCourse);

  const PageComponent = await CourseDetailPage({
    params: Promise.resolve({ slug: "react-foundations" }),
  });

  render(PageComponent);

  assert.ok(screen.getByTestId("course-detail-hero"));
  assert.ok(screen.getByTestId("course-syllabus"));
  assert.ok(screen.getByTestId("course-outcomes"));
  assert.equal(screen.getAllByText("Start Learning").length, 2);
  assert.ok(screen.getByText("/login?callbackUrl=%2Fcourses%2Freact-foundations"));
  assert.equal(vi.mocked(getCourseSidebarData).mock.calls.length, 0);
  assert.equal(vi.mocked(getUserActiveSubscription).mock.calls.length, 0);
});

test("premium course resolves pricing CTA for authenticated non-subscribers", async () => {
  vi.mocked(getServerAuthSession).mockResolvedValue({
    user: { id: "user-1", role: "student", name: "Rio", email: "rio@example.com" },
    expires: "2999-01-01T00:00:00.000Z",
  });
  vi.mocked(resolveCoursePageData).mockResolvedValue({
    ...sampleCourse,
    isFree: false,
  });
  vi.mocked(getCourseSidebarData).mockResolvedValue(null);
  vi.mocked(getUserActiveSubscription).mockResolvedValue(null);

  const PageComponent = await CourseDetailPage({
    params: Promise.resolve({ slug: "react-foundations" }),
  });

  render(PageComponent);

  assert.equal(screen.getAllByText(/get premium access/i).length, 2);
  assert.ok(screen.getByText("/pricing"));
  assert.equal(vi.mocked(getUserActiveSubscription).mock.calls.length, 1);
});
