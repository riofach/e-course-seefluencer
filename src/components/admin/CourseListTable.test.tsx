import assert from "node:assert/strict";

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, test, vi } from "vitest";

const {
  mockPush,
  mockRefresh,
  mockCreateCourse,
  mockDeleteCourse,
} = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
  mockCreateCourse: vi.fn<() => Promise<{ success: true; data: { courseId: string } }>>(),
  mockDeleteCourse: vi.fn<(courseId: string) => Promise<{ success: true; data: undefined }>>(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

vi.mock("~/server/actions/courses", () => ({
  createCourse: async () => await mockCreateCourse(),
  deleteCourse: async (courseId: string) => await mockDeleteCourse(courseId),
}));

import { CourseListTable } from "./CourseListTable";

beforeEach(() => {
  mockPush.mockReset();
  mockRefresh.mockReset();
  mockCreateCourse.mockReset();
  mockDeleteCourse.mockReset();
});

afterEach(() => {
  cleanup();
});

test("CourseListTable renders course badges and create CTA", () => {
  render(
    <CourseListTable
      courses={[
        {
          id: 7,
          title: "Next.js Admin",
          description: null,
          thumbnailUrl: null,
          slug: "nextjs-admin",
          isFree: true,
          isPublished: true,
          createdAt: new Date("2026-03-10T09:00:00.000Z"),
          updatedAt: new Date("2026-03-10T09:00:00.000Z"),
        },
      ]}
    />,
  );

  assert.ok(screen.getByRole("button", { name: /create new course/i }));
  assert.ok(screen.getByText("Published"));
  assert.ok(screen.getByText("Free"));
  assert.ok(screen.getByRole("link", { name: /edit/i }));
});

test("CourseListTable routes to the new course editor after create success", async () => {
  mockCreateCourse.mockResolvedValue({
    success: true,
    data: { courseId: "11" },
  });

  const user = userEvent.setup();

  render(<CourseListTable courses={[]} />);

  await user.click(screen.getAllByRole("button", { name: /create new course/i })[0]!);

  await waitFor(() => {
    assert.equal(mockPush.mock.calls[0]?.[0], "/admin/courses/11");
  });
});

test("CourseListTable confirms delete before refreshing the list", async () => {
  mockDeleteCourse.mockResolvedValue({ success: true, data: undefined });

  const user = userEvent.setup();

  render(
    <CourseListTable
      courses={[
        {
          id: 9,
          title: "Draft Course",
          description: null,
          thumbnailUrl: null,
          slug: "draft-course",
          isFree: false,
          isPublished: false,
          createdAt: new Date("2026-03-10T09:00:00.000Z"),
          updatedAt: new Date("2026-03-10T09:00:00.000Z"),
        },
      ]}
    />,
  );

  await user.click(screen.getByRole("button", { name: /delete/i }));
  await user.click(screen.getByRole("button", { name: /yes, delete course/i }));

  await waitFor(() => {
    assert.equal(mockDeleteCourse.mock.calls[0]?.[0], "9");
    assert.equal(mockRefresh.mock.calls.length, 1);
  });
});
