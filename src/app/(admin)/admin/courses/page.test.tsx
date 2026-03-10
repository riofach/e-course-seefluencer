import assert from "node:assert/strict";

import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { mockGetAllCourses } = vi.hoisted(() => ({
  mockGetAllCourses: vi.fn(),
}));

vi.mock("~/server/queries/courses", () => ({
  getAllCourses: mockGetAllCourses,
}));

import CoursesPage, { CoursesTableSection } from "./page";

beforeEach(() => {
  mockGetAllCourses.mockReset();
});

test("CoursesPage renders the page heading and suspense boundary shell", () => {
  render(<CoursesPage />);

  assert.ok(screen.getByRole("heading", { name: /courses/i }));
  assert.ok(screen.getByText(/manage your draft and published catalog/i));
});

test("CoursesTableSection loads every course for the admin table", async () => {
  mockGetAllCourses.mockResolvedValue([
    {
      id: 1,
      title: "Course 1",
      description: null,
      thumbnailUrl: null,
      slug: "course-1",
      isFree: true,
      isPublished: false,
      createdAt: new Date("2026-03-10T09:00:00.000Z"),
      updatedAt: new Date("2026-03-10T09:00:00.000Z"),
    },
  ]);

  render(await CoursesTableSection());

  assert.ok(screen.getByText("Course 1"));
  assert.equal(mockGetAllCourses.mock.calls.length, 1);
});
