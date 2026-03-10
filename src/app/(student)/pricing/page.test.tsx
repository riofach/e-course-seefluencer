import assert from "node:assert/strict";

import { render, screen } from "@testing-library/react";
import { test, vi } from "vitest";

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
});
