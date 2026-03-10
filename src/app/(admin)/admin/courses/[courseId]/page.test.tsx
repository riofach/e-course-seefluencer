import assert from "node:assert/strict";

import { render, screen } from "@testing-library/react";
import { beforeEach, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { mockGetCourseById, mockNotFound } = vi.hoisted(() => ({
  mockGetCourseById: vi.fn(),
  mockNotFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

vi.mock("~/server/queries/courses", () => ({
  getCourseById: mockGetCourseById,
}));

import CourseEditorPage from "./page";

beforeEach(() => {
  mockGetCourseById.mockReset();
  mockNotFound.mockClear();
});

test("CourseEditorPage renders breadcrumb and editor state", async () => {
  mockGetCourseById.mockResolvedValue({
    id: 3,
    title: "Draft Course",
    description: "Desc",
    thumbnailUrl: null,
    slug: "draft-course",
    isFree: true,
    isPublished: false,
    createdAt: new Date("2026-03-10T09:00:00.000Z"),
    updatedAt: new Date("2026-03-10T09:00:00.000Z"),
  });

  render(
    await CourseEditorPage({
      params: Promise.resolve({ courseId: "3" }),
    }),
  );

  assert.ok(screen.getByText("Admin"));
  assert.ok(screen.getByText("Draft Course"));
  assert.ok(screen.getByRole("button", { name: /publish course/i }));
  assert.ok(screen.getByText(/chapters management will be available in the next update/i));
});

test("CourseEditorPage triggers notFound when the course does not exist", async () => {
  mockGetCourseById.mockResolvedValue(undefined);

  await assert.rejects(() =>
    CourseEditorPage({
      params: Promise.resolve({ courseId: "999" }),
    }),
  );

  assert.equal(mockNotFound.mock.calls.length, 1);
});
