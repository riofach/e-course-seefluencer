import assert from "node:assert/strict";

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, test, vi } from "vitest";

import { shouldUsePublicNavbar } from "./public-navbar-routes";

const usePathnameMock = vi.fn<() => string>();

vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

import { GlobalHeader } from "./global-header";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

test("hides global header on the landing page", () => {
  usePathnameMock.mockReturnValue("/");

  const { container } = render(
    <GlobalHeader>
      <div>Header actions</div>
    </GlobalHeader>,
  );

  assert.equal(container.innerHTML, "");
});

test("hides global header on public courses and pricing routes", () => {
  usePathnameMock.mockReturnValue("/courses/design-basics");

  const { rerender, container } = render(
    <GlobalHeader>
      <div>Header actions</div>
    </GlobalHeader>,
  );

  assert.equal(container.innerHTML, "");

  usePathnameMock.mockReturnValue("/pricing");

  rerender(
    <GlobalHeader>
      <div>Header actions</div>
    </GlobalHeader>,
  );

  assert.equal(container.innerHTML, "");
});

test("hides global header on auth entry routes", () => {
  usePathnameMock.mockReturnValue("/login");

  const { rerender, container } = render(
    <GlobalHeader>
      <div>Header actions</div>
    </GlobalHeader>,
  );

  assert.equal(container.innerHTML, "");

  usePathnameMock.mockReturnValue("/register");

  rerender(
    <GlobalHeader>
      <div>Header actions</div>
    </GlobalHeader>,
  );

  assert.equal(container.innerHTML, "");
});

test("hides global header on admin routes", () => {
  usePathnameMock.mockReturnValue("/admin/courses");

  const { container } = render(
    <GlobalHeader>
      <div>Header actions</div>
    </GlobalHeader>,
  );

  assert.equal(container.innerHTML, "");
});

test("renders global header on non-admin routes outside public navbar shell", () => {
  usePathnameMock.mockReturnValue("/profile");

  render(
    <GlobalHeader>
      <button type="button">Header actions</button>
    </GlobalHeader>,
  );

  assert.ok(screen.getByRole("button", { name: "Header actions" }));
});

test("public navbar route helper matches the intended public route set", () => {
  assert.equal(shouldUsePublicNavbar("/"), true);
  assert.equal(shouldUsePublicNavbar("/courses"), true);
  assert.equal(shouldUsePublicNavbar("/courses/design-basics"), true);
  assert.equal(shouldUsePublicNavbar("/pricing"), true);
  assert.equal(shouldUsePublicNavbar("/login"), true);
  assert.equal(shouldUsePublicNavbar("/register"), true);
  assert.equal(shouldUsePublicNavbar("/profile"), false);
  assert.equal(shouldUsePublicNavbar("/admin/courses"), false);
});
