import assert from "node:assert/strict";

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, test } from "vitest";

import { LandingHighlightsSection } from "./landing-highlights-section";

afterEach(() => {
  cleanup();
});

test("renders the highlights section heading", () => {
  render(<LandingHighlightsSection />);

  assert.ok(
    screen.getByRole("heading", {
      level: 2,
      name: /explore courses built for modern creator growth/i,
    }),
  );
});

test("renders a browse all courses CTA linking to /courses", () => {
  render(<LandingHighlightsSection />);

  const cta = screen.getByRole("link", { name: /browse all courses/i });

  assert.equal(cta.getAttribute("href"), "/courses");
});

test("renders highlighted course cards with access badges", () => {
  render(<LandingHighlightsSection />);

  assert.ok(screen.getByRole("heading", { level: 3, name: /social media mastery/i }));
  assert.ok(screen.getByText(/free/i));
  assert.equal(screen.getAllByText(/premium/i).length, 2);
});
