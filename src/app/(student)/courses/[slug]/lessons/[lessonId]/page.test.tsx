import assert from "node:assert/strict";

import { render, screen } from "@testing-library/react";
import { test, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

import LessonPage from "./page";
import * as authVars from "~/server/auth";
import * as lessonDetail from "~/server/courses/lesson-detail";
import * as quizQuestions from "~/server/courses/quiz-questions";
import * as lessonNav from "~/server/courses/lesson-navigation";
import * as subscriptionQueries from "~/server/queries/subscriptions";

const dummyLesson = {
  id: 1,
  chapterId: 1,
  title: "Quiz Lesson",
  type: "quiz" as const,
  content: null,
  videoUrl: null,
  isFree: true,
  order: 1,
  createdAt: new Date(),
  course: {
    id: 1,
    title: "Course",
    slug: "course",
    isFree: true,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  chapter: { id: 1, title: "Chapter", order: 1 },
};

vi.spyOn(authVars, "getServerAuthSession").mockResolvedValue({
  user: { id: "test-user", role: "student" },
  expires: "1",
});
vi.spyOn(lessonDetail, "getLessonById").mockResolvedValue(dummyLesson);
vi.spyOn(quizQuestions, "getQuizQuestions").mockResolvedValue([
  {
    id: 1,
    lessonId: 1,
    question: "Test Question",
    optionA: "A",
    optionB: "B",
    optionC: "C",
    optionD: "D",
  },
]);
vi.spyOn(lessonNav, "getCourseSidebarData").mockResolvedValue({
  chapters: [],
  completedLessonIds: [],
  completedCount: 0,
  totalLessons: 1,
});
vi.spyOn(lessonNav, "getAdjacentLessons").mockResolvedValue({
  prevLesson: null,
  nextLesson: null,
});
vi.spyOn(subscriptionQueries, "getUserActiveSubscription").mockResolvedValue(null);

test("lesson page fetches quiz questions and renders QuizEngine", async () => {
  const pageArgs: Parameters<typeof LessonPage>[0] = {
    params: Promise.resolve({ slug: "course", lessonId: "1" }),
    searchParams: Promise.resolve({}),
  };

  const PageComponent = await LessonPage(pageArgs);
  render(PageComponent);

  assert.ok(screen.getByText(/Test Question/));
  assert.ok(screen.getByRole("button", { name: /Submit Quiz/i }));
});
