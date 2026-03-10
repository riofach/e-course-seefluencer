import assert from "node:assert/strict";

import { cleanup, render } from "@testing-library/react";
import React from "react";
import { afterEach, test } from "vitest";

import { CourseCatalogSkeleton } from "./course-catalog-skeleton";

afterEach(() => {
  cleanup();
});

test("renders public catalog skeleton with hero and card placeholders", () => {
  const { container } = render(<CourseCatalogSkeleton />);

  const skeletons = container.querySelectorAll("[data-slot='skeleton']");
  assert.ok(skeletons.length >= 10);
  assert.ok(container.textContent?.includes(""));
  assert.ok(container.querySelector(".rounded-\[32px\]") || container.querySelector(".rounded-3xl"));
});
