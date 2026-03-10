import assert from "node:assert/strict";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, test, vi } from "vitest";

const {
  mockCreateLesson,
  mockDeleteLesson,
  mockUpdateLesson,
} = vi.hoisted(() => ({
  mockCreateLesson: vi.fn<
    (chapterId: string) => Promise<{ success: true; data: { lessonId: number } }>
  >(),
  mockDeleteLesson: vi.fn<(lessonId: string) => Promise<{ success: true; data: undefined }>>(),
  mockUpdateLesson: vi.fn<
    (lessonId: string, data: unknown) => Promise<{ success: true; data: undefined }>
  >(),
}));

vi.mock("~/server/actions/lessons", () => ({
  createLesson: async (chapterId: string) => await mockCreateLesson(chapterId),
  deleteLesson: async (lessonId: string) => await mockDeleteLesson(lessonId),
  updateLesson: async (lessonId: string, data: unknown) =>
    await mockUpdateLesson(lessonId, data),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { LessonList } from "./LessonList";

beforeEach(() => {
  mockCreateLesson.mockReset();
  mockDeleteLesson.mockReset();
  mockUpdateLesson.mockReset();
});

afterEach(() => {
  cleanup();
});

const baseLesson = {
  id: 1,
  chapterId: 5,
  title: "Welcome Video",
  type: "video",
  content: "https://example.com/video",
  isFree: false,
  order: 1,
  createdAt: new Date("2026-03-10T09:00:00.000Z"),
};

test("renders empty state when no lessons", () => {
  render(<LessonList courseId={9} chapterId={5} initialLessons={[]} />);

  assert.ok(screen.getByText(/no lessons in this chapter yet/i));
  assert.ok(screen.getByRole("button", { name: /add first lesson/i }));
});

test("renders lesson rows when lessons exist", () => {
  render(<LessonList courseId={9} chapterId={5} initialLessons={[baseLesson]} />);

  assert.ok(screen.getByDisplayValue("Welcome Video"));
  assert.ok(screen.getByDisplayValue("https://example.com/video"));
  assert.ok(screen.getByLabelText(/lesson type for welcome video/i));
  assert.ok(screen.getByRole("switch", { name: /premium toggle for welcome video/i }));
});

test('"Add Lesson" button calls createLesson action', async () => {
  mockCreateLesson.mockResolvedValue({
    success: true,
    data: { lessonId: 10 },
  });

  const user = userEvent.setup();

  render(<LessonList courseId={9} chapterId={5} initialLessons={[baseLesson]} />);

  await user.click(screen.getByRole("button", { name: /add lesson/i }));

  await waitFor(() => {
    assert.equal(mockCreateLesson.mock.calls[0]?.[0], "5");
  });
});

test("premium switch updates lesson free state", async () => {
  mockUpdateLesson.mockResolvedValue({ success: true, data: undefined });

  const user = userEvent.setup();

  render(<LessonList courseId={9} chapterId={5} initialLessons={[baseLesson]} />);

  await user.click(screen.getByRole("switch", { name: /premium toggle for welcome video/i }));

  await waitFor(() => {
    assert.deepEqual(mockUpdateLesson.mock.calls[0], [
      "1",
      {
        title: "Welcome Video",
        type: "video",
        videoUrl: "https://example.com/video",
        content: "",
        isFree: true,
      },
    ]);
  });
});

test("renders quiz builder link for quiz lessons", () => {
  render(
    <LessonList
      courseId={9}
      chapterId={5}
      initialLessons={[
        {
          ...baseLesson,
          id: 11,
          title: "Quiz Lesson",
          type: "quiz",
          content: null,
        },
      ]}
    />,
  );

  const link = screen.getByRole("link", { name: /manage quiz questions/i });

  assert.equal(link.getAttribute("href"), "/admin/courses/9/lessons/11/quiz");
});
