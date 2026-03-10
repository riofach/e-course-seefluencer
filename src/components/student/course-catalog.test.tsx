import assert from "node:assert/strict";

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, test } from "vitest";

import { CourseCatalog } from "./course-catalog";

afterEach(() => {
  cleanup();
});

const sampleCourses = [
  {
    id: 1,
    title: "React Foundations",
    description: "Build better React mental models.",
    slug: "react-foundations",
    thumbnailUrl: "https://example.com/react.jpg",
    accessLabel: "Free" as const,
  },
  {
    id: 2,
    title: "Advanced Next.js",
    description: "Production patterns for App Router.",
    slug: "advanced-nextjs",
    thumbnailUrl: null,
    accessLabel: "Premium" as const,
  },
];

test("renders premium dark-surface course cards with public CTA hierarchy", () => {
  const { container } = render(<CourseCatalog courses={sampleCourses} />);

  const cards = container.querySelectorAll('[data-slot="card"]');
  assert.equal(cards.length, 2);
  assert.ok(cards[0]?.className.includes("bg-[#1A1A24]"));
  assert.ok(cards[0]?.className.includes("border-[#2A2A3C]"));
  assert.ok(cards[0]?.className.includes("rounded-3xl"));
  assert.ok(cards[0]?.className.includes("hover:border-[#3A3A4C]"));

  assert.ok(screen.getByText("Free").className.includes("text-teal-400"));
  assert.ok(screen.getByText("Premium").className.includes("text-indigo-400"));
  assert.ok(screen.getByRole("img", { name: /react foundations/i }));
  assert.ok(screen.getByRole("link", { name: /view course details for react foundations/i }));
  assert.ok(screen.getByText(/build better react mental models/i).className.includes("tracking-tight"));
});

test("renders empty state with clear-search CTA when query has no matches", () => {
  render(<CourseCatalog courses={[]} searchQuery="kubernetes" />);

  assert.ok(screen.getByText(/no courses found/i));
  const cta = screen.getByRole("link", { name: /clear search/i });
  assert.equal(cta.getAttribute("href"), "/courses");
  assert.ok(cta.className.includes("bg-indigo-600"));
});

test("renders no-published-courses empty state with browse-home CTA", () => {
  render(<CourseCatalog courses={[]} />);

  assert.ok(screen.getByText(/no courses available yet/i));
  assert.equal(
    screen.getByRole("link", { name: /back to homepage/i }).getAttribute("href"),
    "/",
  );
});
