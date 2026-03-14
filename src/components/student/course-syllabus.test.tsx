import assert from "node:assert/strict";

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, test } from "vitest";

import { CourseSyllabus } from "./course-syllabus";

afterEach(() => {
  cleanup();
});

const chapters = [
  {
    id: 10,
    title: "Getting Started",
    order: 1,
    lessons: [
      {
        id: 101,
        title: "Welcome",
        type: "video",
        order: 1,
        isFree: true,
      },
      {
        id: 102,
        title: "Premium Deep Dive",
        type: "text",
        order: 2,
        isFree: false,
      },
    ],
  },
];

test("non-subscribers see the pricing upsell CTA for premium syllabus chapters", () => {
  render(
    <CourseSyllabus
      courseSlug="react-foundations"
      chapters={chapters}
      hasActiveSubscription={false}
    />,
  );

  assert.ok(screen.getByRole("link", { name: /unlock with premium/i }));
  assert.ok(screen.getByText(/subscribe for full access to every lesson in this chapter/i));
  assert.ok(
    screen.getByRole("link", { name: /welcome/i }).getAttribute("href") ===
      "/courses/react-foundations/lessons/101",
  );
});

test("subscribers see a non-upsell premium unlocked state instead of the pricing CTA", () => {
  render(
    <CourseSyllabus
      courseSlug="react-foundations"
      chapters={chapters}
      hasActiveSubscription
    />,
  );

  assert.equal(screen.queryByRole("link", { name: /^unlock with premium$/i }), null);
  assert.ok(screen.getByText(/premium unlocked — your subscription already includes every lesson in this chapter/i));
  assert.ok(screen.getByText(/^premium unlocked$/i));
});
