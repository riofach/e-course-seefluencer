import assert from "node:assert/strict";

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "font-inter-variable" }),
  Playfair_Display: () => ({ variable: "font-playfair-variable" }),
}));

vi.mock("~/components/shared/public-navbar", () => ({
  PublicNavbar: () => <nav data-testid="public-navbar">navbar</nav>,
}));

import { PublicNavbarShell } from "./public-navbar-shell";

afterEach(() => {
  cleanup();
});

test("renders canonical public shell with navbar, font variables, and shared theme defaults", () => {
  const { container } = render(
    <PublicNavbarShell>
      <main>public content</main>
    </PublicNavbarShell>,
  );

  assert.ok(screen.getByTestId("public-navbar"));
  assert.ok(screen.getByText("public content"));

  const wrapper = container.firstElementChild;
  assert.ok(wrapper);
  assert.match(
    wrapper.className,
    /font-inter-variable.*font-playfair-variable.*flex.*min-h-screen.*flex-col.*bg-white.*font-\[family-name:var\(--font-inter\)\].*tracking-\[-0\.02em\].*text-slate-900.*dark:bg-\[#0F0F14\].*dark:text-white/,
  );

  const contentWrapper = wrapper.lastElementChild;
  assert.ok(contentWrapper);
  assert.match(contentWrapper.className, /flex-1/);
});
