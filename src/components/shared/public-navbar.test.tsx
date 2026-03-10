import assert from "node:assert/strict";

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

vi.mock("./public-mobile-menu", () => ({
  PublicMobileMenu: ({ displayName }: { displayName: string | null }) => (
    <button type="button" data-testid="public-mobile-menu" aria-label="Open navigation menu">
      {displayName ?? "guest"}
    </button>
  ),
}));

vi.mock("./logout-button", () => ({
  LogoutButton: (props: React.ComponentProps<"button">) => (
    <button type="button" {...props}>
      Sign Out
    </button>
  ),
}));

import { PublicNavbarContent } from "./public-navbar-content";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderNavbar(props: React.ComponentProps<typeof PublicNavbarContent>) {
  return render(<PublicNavbarContent {...props} />);
}

test("renders the Seefluencer logo link", () => {
  renderNavbar({ displayName: null, profileImage: "", userEmail: "" });

  const logoLink = screen.getByRole("link", { name: /seefluencer/i });

  assert.equal(logoLink.getAttribute("href"), "/");
});

test("renders Home, Courses, and Pricing links in the navbar", () => {
  renderNavbar({
    displayName: null,
    profileImage: "",
    userEmail: "",
  });
  assert.equal(
    screen.getAllByRole("link", { name: "Home" })[0]?.getAttribute("href"),
    "/#hero",
  );
  assert.equal(
    screen.getAllByRole("link", { name: "Courses" })[0]?.getAttribute("href"),
    "/courses",
  );
  assert.equal(
    screen.getAllByRole("link", { name: "Pricing" })[0]?.getAttribute("href"),
    "/pricing",
  );
});

test("renders Sign In and Sign Up actions when no session exists", () => {
  renderNavbar({
    displayName: null,
    profileImage: "",
    userEmail: "",
  });

  assert.ok(screen.getAllByRole("link", { name: /sign in/i }).length >= 1);
  assert.ok(screen.getAllByRole("link", { name: /sign up/i }).length >= 1);
});

test("renders the user display name when session exists", () => {
  renderNavbar({
    displayName: "Rio Display",
    profileImage: "",
    userEmail: "rio@example.com",
  });

  assert.equal(screen.getAllByText("Rio Display").length, 2);
});

test("renders the mobile menu trigger with accessible aria-label regression", () => {
  renderNavbar({ displayName: null, profileImage: "", userEmail: "" });

  assert.equal(screen.getByTestId("public-mobile-menu").getAttribute("aria-label"), "Open navigation menu");
});
