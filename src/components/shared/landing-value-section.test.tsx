import assert from "node:assert/strict";

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, test } from "vitest";

import { LandingValueSection } from "./landing-value-section";

afterEach(() => {
  cleanup();
});

test("renders the Seefluencer value proposition heading", () => {
  render(<LandingValueSection />);

  assert.ok(
    screen.getByRole("heading", {
      level: 2,
      name: /learning designed for ambitious digital creators/i,
    }),
  );
});

test("renders creator-focused benefit cards", () => {
  render(<LandingValueSection />);

  assert.ok(screen.getByRole("heading", { level: 3, name: /learn from real creators/i }));
  assert.ok(screen.getByRole("heading", { level: 3, name: /structured learning path/i }));
  assert.ok(screen.getByRole("heading", { level: 3, name: /track your progress/i }));
});
