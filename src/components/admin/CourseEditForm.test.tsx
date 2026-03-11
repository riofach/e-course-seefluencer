import assert from "node:assert/strict";

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, test, vi } from "vitest";
import type { CourseUpdateInput } from "~/lib/validations/course";

const {
  mockRefresh,
  mockUpdateCourse,
  mockTogglePublishStatus,
  mockUploadCourseThumbnail,
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
  mockUploadCourseThumbnail: vi.fn<
    (courseId: string, formData: FormData) => Promise<{ success: true; data: { thumbnailUrl: string } } | { success: false; error: string }>
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
  uploadCourseThumbnail: async (courseId: string, formData: FormData) =>
    await mockUploadCourseThumbnail(courseId, formData),
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
  mockUploadCourseThumbnail.mockReset();
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

test("CourseEditForm shows validation errors on blur and renders thumbnail helper UI", async () => {
  render(<CourseEditForm course={baseCourse} />);

  const titleInput = screen.getByLabelText(/title/i);
  fireEvent.change(titleInput, { target: { value: "" } });
  fireEvent.blur(titleInput);

  assert.ok(await screen.findByText(/title is required/i));

  assert.ok(screen.getByLabelText(/thumbnail image/i));
  assert.ok(screen.getByText(/upload a single jpg, png, or webp image up to 5 mb/i));
  assert.ok(screen.getByText(/thumbnail placeholder/i));
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

test("CourseEditForm uploads a selected thumbnail and refreshes the preview path", async () => {
  mockUploadCourseThumbnail.mockResolvedValue({
    success: true,
    data: {
      thumbnailUrl: "/uploads/course-thumbnails/course-5.webp",
    },
  });

  render(<CourseEditForm course={baseCourse} />);

  const fileInput = screen.getByLabelText(/thumbnail image/i);
  fireEvent.change(fileInput, {
    target: {
      files: [
        new File([new Uint8Array([1, 2, 3])], "thumbnail.png", {
          type: "image/png",
        }),
      ],
    },
  });

  fireEvent.click(screen.getByRole("button", { name: /upload thumbnail/i }));

  await waitFor(() => {
    assert.equal(mockUploadCourseThumbnail.mock.calls[0]?.[0], "5");
    assert.ok(screen.getByText(/stored asset path: \/uploads\/course-thumbnails\/course-5\.webp/i));
    assert.equal(mockToastSuccess.mock.calls.at(-1)?.[0], "Thumbnail updated");
  }, { timeout: 2000 });
}, 10000);

test("CourseEditForm surfaces upload failures without clearing the existing thumbnail preview", async () => {
  mockUploadCourseThumbnail.mockResolvedValue({
    success: false,
    error: "Unsupported thumbnail format. Upload JPG, PNG, or WebP.",
  });

  render(
    <CourseEditForm
      course={{
        ...baseCourse,
        thumbnailUrl: "/uploads/course-thumbnails/existing.webp",
      }}
    />,
  );

  const fileInput = screen.getByLabelText(/thumbnail image/i);
  fireEvent.change(fileInput, {
    target: {
      files: [
        new File([new Uint8Array([1, 2, 3])], "thumbnail.gif", {
          type: "image/gif",
        }),
      ],
    },
  });

  fireEvent.click(screen.getByRole("button", { name: /replace thumbnail/i }));

  await waitFor(() => {
    assert.equal(
      mockToastError.mock.calls.at(-1)?.[0],
      "Unsupported thumbnail format. Upload JPG, PNG, or WebP.",
    );
    assert.ok(screen.getByText(/stored asset path: \/uploads\/course-thumbnails\/existing\.webp/i));
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
