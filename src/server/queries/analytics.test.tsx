import assert from "node:assert/strict";

import { beforeEach, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

type EqCondition = { type: "eq"; field: string; value: string };
type GtCondition = { type: "gt"; field: string; value: Date };

const {
  mockCount,
  mockEq,
  mockGt,
  mockAnd,
  mockSelect,
  mockFrom,
  mockWhere,
  mockUsers,
  mockCourses,
  mockSubscriptions,
} = vi.hoisted(() => ({
  mockCount: vi.fn(() => "count-token"),
  mockEq: vi.fn((field: string, value: string): EqCondition => ({
    type: "eq",
    field,
    value,
  })),
  mockGt: vi.fn((field: string, value: Date): GtCondition => ({
    type: "gt",
    field,
    value,
  })),
  mockAnd: vi.fn((...conditions: [EqCondition, GtCondition]) => ({
    type: "and",
    conditions,
  })),
  mockSelect: vi.fn(),
  mockFrom: vi.fn(),
  mockWhere: vi.fn(),
  mockUsers: { table: "users" },
  mockCourses: { table: "courses" },
  mockSubscriptions: {
    table: "subscriptions",
    status: "subscriptions.status",
    endDate: "subscriptions.endDate",
  },
}));

vi.mock("drizzle-orm", () => ({
  count: mockCount,
  eq: mockEq,
  gt: mockGt,
  and: mockAnd,
}));

vi.mock("~/server/db", () => ({
  db: {
    select: mockSelect,
  },
}));

vi.mock("~/server/db/schema", () => ({
  users: mockUsers,
  courses: mockCourses,
  subscriptions: mockSubscriptions,
}));

const analytics = await import("./analytics");

beforeEach(() => {
  mockCount.mockClear();
  mockEq.mockClear();
  mockGt.mockClear();
  mockAnd.mockClear();
  mockSelect.mockReset();
  mockFrom.mockReset();
  mockWhere.mockReset();
});

test("getTotalUsersCount returns aggregated user count", async () => {
  mockSelect.mockReturnValue({ from: mockFrom });
  mockFrom.mockResolvedValue([{ count: 12 }]);

  const result = await analytics.getTotalUsersCount();

  assert.equal(result, 12);
  assert.deepEqual(mockSelect.mock.calls[0]?.[0], { count: "count-token" });
  assert.equal(mockFrom.mock.calls[0]?.[0], mockUsers);
});

test("getTotalCoursesCount falls back to zero when query returns no rows", async () => {
  mockSelect.mockReturnValue({ from: mockFrom });
  mockFrom.mockResolvedValue([]);

  const result = await analytics.getTotalCoursesCount();

  assert.equal(result, 0);
  assert.equal(mockFrom.mock.calls[0]?.[0], mockCourses);
});

test("getActiveSubscriptionsCount filters by active status and future endDate", async () => {
  mockSelect.mockReturnValue({ from: mockFrom });
  mockFrom.mockReturnValue({ where: mockWhere });
  mockWhere.mockResolvedValue([{ count: 3 }]);

  const result = await analytics.getActiveSubscriptionsCount();

  assert.equal(result, 3);
  assert.equal(mockEq.mock.calls[0]?.[0], mockSubscriptions.status);
  assert.equal(mockEq.mock.calls[0]?.[1], "active");
  assert.equal(mockGt.mock.calls[0]?.[0], mockSubscriptions.endDate);
  assert.equal(mockGt.mock.calls[0]?.[1] instanceof Date, true);
  assert.equal(mockAnd.mock.calls.length, 1);
  assert.equal(mockWhere.mock.calls.length, 1);
});
