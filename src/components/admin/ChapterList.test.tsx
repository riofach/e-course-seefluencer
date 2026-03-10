import assert from "node:assert/strict";

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, test, vi } from "vitest";

const { mockCreateChapter, mockDeleteChapter, mockReorderChapters } = vi.hoisted(() => ({
  mockCreateChapter: vi.fn<
    (courseId: string, title?: string) => Promise<{ success: true; data: { chapterId: number } }>
  >(),
  mockDeleteChapter: vi.fn<(chapterId: string) => Promise<{ success: true; data: undefined }>>(),
  mockReorderChapters: vi.fn<
    (courseId: string, orderedIds: number[]) => Promise<{ success: true; data: undefined }>
  >(),
}));

vi.mock("~/server/actions/chapters", () => ({
  createChapter: async (courseId: string, title?: string) => await mockCreateChapter(courseId, title),
  deleteChapter: async (chapterId: string) => await mockDeleteChapter(chapterId),
  reorderChapters: async (courseId: string, orderedIds: number[]) =>
    await mockReorderChapters(courseId, orderedIds),
  updateChapter: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { ChapterList } from "./ChapterList";

beforeEach(() => {
  mockCreateChapter.mockReset();
  mockDeleteChapter.mockReset();
  mockReorderChapters.mockReset();
});

afterEach(() => {
  cleanup();
});

const baseChapter = {
  id: 1,
  courseId: 5,
  title: "Introduction",
  description: null,
  order: 1,
  createdAt: new Date("2026-03-10T09:00:00.000Z"),
};

test("renders empty state when no chapters", () => {
  render(<ChapterList courseId="5" initialChapters={[]} />);

  assert.ok(screen.getByText(/no chapters yet/i));
  assert.ok(screen.getByRole("button", { name: /add first chapter/i }));
});

test("renders chapter rows when chapters exist", () => {
  render(<ChapterList courseId="5" initialChapters={[baseChapter]} />);

  assert.ok(screen.getByDisplayValue("Introduction"));
  assert.ok(screen.getByText("#1"));
  assert.ok(screen.getByText(/0 lessons/i));
});

test('"Add Chapter" button shows an inline draft row instead of immediate placeholder creation', async () => {
  const user = userEvent.setup();

  render(<ChapterList courseId="5" initialChapters={[]} />);

  await user.click(screen.getByRole("button", { name: /add first chapter/i }));

  assert.ok(screen.getByPlaceholderText(/chapter title/i));
  assert.equal(mockCreateChapter.mock.calls.length, 0);
});

test('draft chapter is saved only after the user enters a title and confirms save', async () => {
  mockCreateChapter.mockResolvedValue({
    success: true,
    data: { chapterId: 10 },
  });

  const user = userEvent.setup();

  render(<ChapterList courseId="5" initialChapters={[]} />);

  await user.click(screen.getByRole("button", { name: /add first chapter/i }));
  await user.type(screen.getByPlaceholderText(/chapter title/i), "Bab Baru");
  await user.click(screen.getByRole("button", { name: /save chapter/i }));

  await waitFor(() => {
    assert.equal(mockCreateChapter.mock.calls[0]?.[0], "5");
    assert.equal(mockCreateChapter.mock.calls[0]?.[1], "Bab Baru");
  });
});

test("draft chapter shows validation error when user tries to save an empty title", async () => {
  const user = userEvent.setup();

  render(<ChapterList courseId="5" initialChapters={[]} />);

  await user.click(screen.getByRole("button", { name: /add first chapter/i }));

  const input = screen.getByPlaceholderText(/chapter title/i);
  fireEvent.blur(input);
  await user.click(screen.getByRole("button", { name: /save chapter/i }));

  assert.ok(screen.getByText(/title is required/i));
  assert.equal(mockCreateChapter.mock.calls.length, 0);
});
