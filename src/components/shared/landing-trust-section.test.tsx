import assert from "node:assert/strict";

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, test } from "vitest";

import { LandingTrustSection } from "./landing-trust-section";

afterEach(() => {
  cleanup();
});

test("renders the trust section heading", () => {
  render(<LandingTrustSection />);

  assert.ok(
    screen.getByRole("heading", {
      level: 2,
      name: /a learning platform built to earn confidence/i,
    }),
  );
});

test("renders social proof stats", () => {
  render(<LandingTrustSection />);

  assert.ok(screen.getByText(/500\+/i));
  assert.ok(screen.getByText(/students enrolled/i));
  assert.ok(screen.getByText(/4\.8★/i));
});

test("renders testimonial citations", () => {
  render(<LandingTrustSection />);

  assert.ok(screen.getByText(/nadia aulia/i));
  assert.ok(screen.getByText(/rafi firmansyah/i));
});
