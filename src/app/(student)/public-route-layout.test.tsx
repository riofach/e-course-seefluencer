import assert from "node:assert/strict";

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, test, vi } from "vitest";

vi.mock("~/components/shared/public-navbar", () => ({
  PublicNavbar: () => <div data-testid="public-navbar">Shared Public Navbar</div>,
}));

import CoursesLayout from "./courses/layout";
import PricingLayout from "./pricing/layout";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

test("courses layout renders the shared public navbar shell", () => {
  render(
    <CoursesLayout>
      <div>Courses Content</div>
    </CoursesLayout>,
  );

  assert.ok(screen.getByTestId("public-navbar"));
  assert.ok(screen.getByText("Courses Content"));
});

test("pricing layout renders the shared public navbar shell", () => {
  render(
    <PricingLayout>
      <div>Pricing Content</div>
    </PricingLayout>,
  );

  assert.ok(screen.getByTestId("public-navbar"));
  assert.ok(screen.getByText("Pricing Content"));
});
