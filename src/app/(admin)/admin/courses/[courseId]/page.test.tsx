import assert from "node:assert/strict";

import { render, screen } from "@testing-library/react";
import { beforeEach, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { mockGetCourseById, mockGetLessonsByCourseId, mockNotFound } = vi.hoisted(() => ({
  mockGetCourseById: vi.fn(),
  mockGetLessonsByCourseId: vi.fn(),
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

vi.mock("~/server/queries/lessons", () => ({
  getLessonsByCourseId: mockGetLessonsByCourseId,
}));

vi.mock("~/server/queries/chapters", () => ({
  getChaptersByCourseId: vi.fn(async () => []),
}));

vi.mock("~/components/admin/CourseEditForm", () => ({
  CourseEditForm: () => <div>Course edit form</div>,
  CoursePublishStatusButton: () => <button type="button">Publish Course</button>,
}));

vi.mock("~/components/admin/ChapterList", () => ({
  ChapterList: () => <div>Chapters</div>,
}));

import CourseEditorPage from "./page";

beforeEach(() => {
  mockGetCourseById.mockReset();
  mockGetLessonsByCourseId.mockReset();
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
  mockGetLessonsByCourseId.mockResolvedValue({});

  render(
    await CourseEditorPage({
      params: Promise.resolve({ courseId: "3" }),
    }),
  );

  assert.ok(screen.getByText("Admin"));
  assert.ok(screen.getByRole("heading", { name: "Draft Course" }));
  assert.ok(screen.getByRole("button", { name: /publish course/i }));
  assert.equal(mockGetLessonsByCourseId.mock.calls[0]?.[0], 3);
  assert.ok(screen.getByText(/chapters/i));
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
