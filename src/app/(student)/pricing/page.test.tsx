import assert from "node:assert/strict";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

const { redirectMock } = vi.hoisted(() => ({
  redirectMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("~/components/student/pricing-page-client", () => ({
  PricingPageClient: (props: Record<string, unknown>) => (
    <div data-testid="pricing-page-client">{JSON.stringify(props)}</div>
  ),
}));

import PricingPage from "./page";
import * as authVars from "~/server/auth";
import * as plansQueries from "~/server/queries/plans";
import * as subscriptionQueries from "~/server/queries/subscriptions";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("PricingPage", () => {
  test("pricing page renders for guests without redirecting to login", async () => {
    redirectMock.mockReset();
    vi.spyOn(authVars, "getServerAuthSession").mockResolvedValue(null);
    vi.spyOn(plansQueries, "getPlans").mockResolvedValue([
      {
        id: 1,
        name: "Pro Monthly",
        price: 150000,
        durationDays: 30,
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
      },
    ]);
    const activeSubscriptionSpy = vi
      .spyOn(subscriptionQueries, "getUserActiveSubscription")
      .mockResolvedValue(null);

    const PageComponent = await PricingPage({
      searchParams: Promise.resolve({}),
    });

    render(PageComponent);

    assert.equal(redirectMock.mock.calls.length, 0);
    assert.equal(activeSubscriptionSpy.mock.calls.length, 0);
    assert.ok(screen.getByText(/pricing that feels like momentum/i));
    assert.ok(screen.getByTestId("pricing-page-client").textContent?.includes('"isAuthenticated":false'));
    assert.ok(screen.getByTestId("pricing-page-client").textContent?.includes('"activePlanId":null'));
  });

  test("pricing page passes through the active subscription plan id", async () => {
    redirectMock.mockReset();
    vi.spyOn(authVars, "getServerAuthSession").mockResolvedValue({
      user: { id: "user-1", role: "student", name: "Rio", email: "rio@example.com" },
      expires: "2999-01-01T00:00:00.000Z",
    });
    vi.spyOn(plansQueries, "getPlans").mockResolvedValue([
      {
        id: 1,
        name: "Pro Monthly",
        price: 150000,
        durationDays: 30,
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
      },
    ]);
    vi.spyOn(subscriptionQueries, "getUserActiveSubscription").mockResolvedValue({
      id: "sub-1",
      userId: "user-1",
      planId: 1,
      status: "active",
    } as Awaited<ReturnType<typeof subscriptionQueries.getUserActiveSubscription>>);

    const PageComponent = await PricingPage({
      searchParams: Promise.resolve({}),
    });

    render(PageComponent);

    assert.ok(screen.getByTestId("pricing-page-client").textContent?.includes('"isSubscribed":true'));
    assert.ok(screen.getByTestId("pricing-page-client").textContent?.includes('"activePlanId":1'));
  });
});
