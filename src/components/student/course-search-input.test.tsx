import assert from "node:assert/strict";

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, test, vi } from "vitest";

const { replaceMock, searchParamsValue } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  searchParamsValue: new URLSearchParams(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
  usePathname: () => "/courses",
  useSearchParams: () => searchParamsValue,
}));

import { CourseSearchInput } from "./course-search-input";

afterEach(() => {
  cleanup();
  replaceMock.mockReset();
});

test("renders theme-aware public-surface search styling with indigo focus affordance hooks", () => {
  const { container } = render(<CourseSearchInput defaultValue="react" />);

  const formShell = container.querySelector("form > div");
  assert.ok(formShell);
  assert.ok(formShell.className.includes("bg-white/85"));
  assert.ok(formShell.className.includes("dark:bg-[#1A1A24]"));
  assert.ok(formShell.className.includes("border-slate-200/80"));
  assert.ok(formShell.className.includes("dark:border-[#2A2A3C]"));
  assert.ok(formShell.className.includes("focus-within:border-indigo-500"));
  assert.ok(formShell.className.includes("focus-within:ring-1"));

  const input = screen.getByLabelText(/cari kursus berdasarkan judul/i);
  assert.ok(input.className.includes("placeholder:text-slate-400"));
  assert.ok(input.className.includes("dark:placeholder:text-gray-500"));
  assert.equal(input.getAttribute("placeholder"), "Search courses...");
});
