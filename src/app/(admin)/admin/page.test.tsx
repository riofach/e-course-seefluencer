import assert from "node:assert/strict";

import { render, screen } from "@testing-library/react";
import { afterEach, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

const {
  mockGetTotalUsersCount,
  mockGetTotalCoursesCount,
  mockGetActiveSubscriptionsCount,
} = vi.hoisted(() => ({
  mockGetTotalUsersCount: vi.fn(),
  mockGetTotalCoursesCount: vi.fn(),
  mockGetActiveSubscriptionsCount: vi.fn(),
}));

vi.mock("~/server/queries/analytics", () => ({
  getTotalUsersCount: mockGetTotalUsersCount,
  getTotalCoursesCount: mockGetTotalCoursesCount,
  getActiveSubscriptionsCount: mockGetActiveSubscriptionsCount,
}));

import { AdminDashboardStatsSection } from "./admin-dashboard-stats";
import AdminDashboardPage from "./page";

afterEach(() => {
  vi.restoreAllMocks();
});

test("AdminDashboardStatsSection renders all analytics cards with counts", async () => {
  mockGetTotalUsersCount.mockResolvedValue(42);
  mockGetTotalCoursesCount.mockResolvedValue(8);
  mockGetActiveSubscriptionsCount.mockResolvedValue(5);

  render(await AdminDashboardStatsSection());

  assert.ok(screen.getByText("Total Users"));
  assert.ok(screen.getByText("42"));
  assert.ok(screen.getByText("Total Courses"));
  assert.ok(screen.getByText("8"));
  assert.ok(screen.getByText("Active Subscriptions"));
  assert.ok(screen.getByText("5"));
});

test("AdminDashboardStatsSection returns fallback alert when analytics query fails", async () => {
  mockGetTotalUsersCount.mockRejectedValue(new Error("db down"));
  mockGetTotalCoursesCount.mockResolvedValue(8);
  mockGetActiveSubscriptionsCount.mockResolvedValue(5);

  render(await AdminDashboardStatsSection());

  assert.ok(screen.getByRole("alert"));
  assert.ok(screen.getByText(/analytics could not be loaded/i));
});

test("AdminDashboardPage renders heading and analytics section fallback boundary", () => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);

  render(<AdminDashboardPage />);

  assert.ok(screen.getByRole("heading", { name: /dashboard/i }));
  assert.ok(screen.getByText(/monitor key platform metrics/i));
});
