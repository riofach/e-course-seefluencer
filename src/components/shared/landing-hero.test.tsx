import assert from "node:assert/strict";

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, test } from "vitest";

import { LandingHero } from "./landing-hero";

afterEach(() => {
  cleanup();
});

test("renders the primary CTA linking to /courses", () => {
  render(<LandingHero />);

  const primaryCta = screen.getByRole("link", { name: /explore courses/i });

  assert.equal(primaryCta.getAttribute("href"), "/courses");
});

test("renders the premium creator-led value proposition", () => {
  render(<LandingHero />);

  assert.ok(
    screen.getByRole("heading", {
      level: 1,
      name: /turn creator insight into structured lessons you can actually finish/i,
    }),
  );
  assert.ok(screen.getByText(/premium learning paths from trusted creators/i));
});
