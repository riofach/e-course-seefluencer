import assert from "node:assert/strict";

import { test } from "vitest";

import { shouldUsePublicNavbar } from "./public-navbar-routes";

test("returns true for public marketing and auth routes", () => {
  assert.equal(shouldUsePublicNavbar("/"), true);
  assert.equal(shouldUsePublicNavbar("/courses"), true);
  assert.equal(shouldUsePublicNavbar("/courses/design-basics"), true);
  assert.equal(shouldUsePublicNavbar("/pricing"), true);
  assert.equal(shouldUsePublicNavbar("/login"), true);
  assert.equal(shouldUsePublicNavbar("/register"), true);
});

test("returns false for non-public routes", () => {
  assert.equal(shouldUsePublicNavbar("/profile"), false);
  assert.equal(shouldUsePublicNavbar("/admin"), false);
});
