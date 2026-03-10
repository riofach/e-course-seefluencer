import assert from "node:assert/strict";

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, test, vi } from "vitest";
import type { CourseUpdateInput } from "~/lib/validations/course";

const {
  mockRefresh,
  mockUpdateCourse,
  mockTogglePublishStatus,
  mockToastSuccess,
  mockToastError,
} = vi.hoisted(() => ({
  mockRefresh: vi.fn(),
  mockUpdateCourse: vi.fn<
    (courseId: string, data: CourseUpdateInput) => Promise<{ success: true; data: undefined }>
  >(),
  mockTogglePublishStatus: vi.fn<
    (courseId: string) => Promise<{ success: true; data: { newStatus: string } }>
  >(),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}));

vi.mock("~/server/actions/courses", () => ({
  updateCourse: async (courseId: string, data: CourseUpdateInput) =>
    await mockUpdateCourse(courseId, data),
  toggleCoursePublishStatus: async (courseId: string) =>
    await mockTogglePublishStatus(courseId),
}));

vi.mock("sonner", () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

import { CourseEditForm, CoursePublishStatusButton } from "./CourseEditForm";

beforeEach(() => {
  mockRefresh.mockReset();
  mockUpdateCourse.mockReset();
  mockTogglePublishStatus.mockReset();
  mockToastSuccess.mockReset();
  mockToastError.mockReset();
});

afterEach(() => {
  cleanup();
});

const baseCourse = {
  id: 5,
  title: "Draft Course",
  description: "Old description",
  thumbnailUrl: "",
  slug: "draft-course",
  isFree: false,
  isPublished: false,
  createdAt: new Date("2026-03-10T09:00:00.000Z"),
  updatedAt: new Date("2026-03-10T09:00:00.000Z"),
};

test("CourseEditForm shows validation errors on blur and previews thumbnails", async () => {
  render(<CourseEditForm course={baseCourse} />);

  const titleInput = screen.getByLabelText(/title/i);
  fireEvent.change(titleInput, { target: { value: "" } });
  fireEvent.blur(titleInput);

  assert.ok(await screen.findByText(/title is required/i));

  const thumbnailInput = screen.getByLabelText(/thumbnail url/i);
  fireEvent.change(thumbnailInput, {
    target: { value: "https://example.com/thumb.png" },
  });

  assert.ok(screen.getByAltText(/thumbnail preview/i));
}, 10000);

test("CourseEditForm auto-saves valid values after debounce", async () => {
  mockUpdateCourse.mockResolvedValue({ success: true, data: undefined });

  render(<CourseEditForm course={baseCourse} />);

  const titleInput = screen.getByLabelText(/title/i);
  fireEvent.change(titleInput, { target: { value: "Updated Course" } });
  fireEvent.blur(titleInput);

  await waitFor(() => {
    assert.equal(mockUpdateCourse.mock.calls[0]?.[0], "5");
    assert.equal(mockToastSuccess.mock.calls[0]?.[0], "Draft saved automatically");
  }, { timeout: 2000 });
}, 10000);

test("CoursePublishStatusButton toggles the publish state and refreshes the page", async () => {
  mockTogglePublishStatus.mockResolvedValue({
    success: true,
    data: { newStatus: "published" },
  });

  render(<CoursePublishStatusButton courseId="5" isPublished={false} />);

  fireEvent.click(screen.getByRole("button", { name: /publish course/i }));

  await waitFor(() => {
    assert.equal(mockTogglePublishStatus.mock.calls[0]?.[0], "5");
    assert.equal(mockRefresh.mock.calls.length, 1);
  }, { timeout: 2000 });
}, 10000);
