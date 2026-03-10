import assert from "node:assert/strict";

import { render, screen } from "@testing-library/react";
import { beforeEach, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { mockGetCourseById, mockGetLessonById, mockGetQuizzesByLessonId, mockNotFound } = vi.hoisted(
  () => ({
    mockGetCourseById: vi.fn(),
    mockGetLessonById: vi.fn(),
    mockGetQuizzesByLessonId: vi.fn(),
    mockNotFound: vi.fn(() => {
      throw new Error("NEXT_NOT_FOUND");
    }),
  }),
);

vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

vi.mock("~/server/queries/courses", () => ({
  getCourseById: mockGetCourseById,
}));

vi.mock("~/server/queries/lessons", () => ({
  getLessonById: mockGetLessonById,
}));

vi.mock("~/server/queries/quizzes", () => ({
  getQuizzesByLessonId: mockGetQuizzesByLessonId,
}));

vi.mock("~/components/admin/QuizQuestionList", () => ({
  QuizQuestionList: ({ lessonId, initialQuizzes }: { lessonId: number; initialQuizzes: unknown[] }) => (
    <div>{`Quiz list ${lessonId} (${initialQuizzes.length})`}</div>
  ),
}));

import QuizBuilderPage from "./page";

beforeEach(() => {
  mockGetCourseById.mockReset();
  mockGetLessonById.mockReset();
  mockGetQuizzesByLessonId.mockReset();
  mockNotFound.mockClear();
});

test("QuizBuilderPage renders breadcrumb and quiz builder content", async () => {
  mockGetCourseById.mockResolvedValue({
    id: 3,
    title: "Admin Course",
    description: "Desc",
    thumbnailUrl: null,
    slug: "admin-course",
    isFree: false,
    isPublished: false,
    createdAt: new Date("2026-03-10T09:00:00.000Z"),
    updatedAt: new Date("2026-03-10T09:00:00.000Z"),
  });
  mockGetLessonById.mockResolvedValue({
    id: 9,
    chapterId: 2,
    title: "Quiz Lesson",
    type: "quiz",
    content: null,
    isFree: false,
    order: 1,
    createdAt: new Date("2026-03-10T09:00:00.000Z"),
  });
  mockGetQuizzesByLessonId.mockResolvedValue([
    {
      id: 1,
      lessonId: 9,
      question: "Question 1",
      optionA: "A",
      optionB: "B",
      optionC: "C",
      optionD: "D",
      correctAnswer: "A",
      points: 10,
      createdAt: new Date("2026-03-10T09:00:00.000Z"),
    },
  ]);

  render(
    await QuizBuilderPage({
      params: Promise.resolve({ courseId: "3", lessonId: "9" }),
    }),
  );

  assert.ok(screen.getByText("Admin"));
  assert.ok(screen.getByRole("heading", { name: "Quiz Builder" }));
  assert.ok(screen.getByText("Quiz Lesson"));
  assert.ok(screen.getByText("1 question"));
  assert.ok(screen.getByText("Quiz list 9 (1)"));
});

test("QuizBuilderPage triggers notFound for non-quiz lessons", async () => {
  mockGetCourseById.mockResolvedValue({
    id: 3,
    title: "Admin Course",
    description: "Desc",
    thumbnailUrl: null,
    slug: "admin-course",
    isFree: false,
    isPublished: false,
    createdAt: new Date("2026-03-10T09:00:00.000Z"),
    updatedAt: new Date("2026-03-10T09:00:00.000Z"),
  });
  mockGetLessonById.mockResolvedValue({
    id: 9,
    chapterId: 2,
    title: "Video Lesson",
    type: "video",
    content: null,
    isFree: false,
    order: 1,
    createdAt: new Date("2026-03-10T09:00:00.000Z"),
  });

  await assert.rejects(() =>
    QuizBuilderPage({
      params: Promise.resolve({ courseId: "3", lessonId: "9" }),
    }),
  );

  assert.equal(mockNotFound.mock.calls.length, 1);
});
