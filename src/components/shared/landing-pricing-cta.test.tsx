import assert from "node:assert/strict";

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, test } from "vitest";

import { LandingPricingCTA } from "./landing-pricing-cta";

afterEach(() => {
  cleanup();
});

test("renders pricing CTA links with correct destinations", () => {
  render(<LandingPricingCTA />);

  const pricingLink = screen.getByRole("link", { name: /view pricing plans/i });
  const coursesLink = screen.getByRole("link", { name: /start browsing free courses/i });

  assert.equal(pricingLink.getAttribute("href"), "/pricing");
  assert.equal(coursesLink.getAttribute("href"), "/courses");
});

test("renders the premium journey messaging", () => {
  render(<LandingPricingCTA />);

  assert.ok(
    screen.getByRole("heading", {
      level: 2,
      name: /unlock your full creative potential/i,
    }),
  );
});
