import assert from "node:assert/strict";
import test from "node:test";

import {
  requireAuthenticatedUserId,
  resolveLessonPageData,
  shouldShowPaywallOverlay,
} from "./page.helpers.ts";

void test("requireAuthenticatedUserId redirects unauthenticated users to login", async () => {
  let redirectedTo = "";

  await assert.rejects(
    async () =>
      requireAuthenticatedUserId(null, (path) => {
        redirectedTo = path;
        throw new Error("NEXT_REDIRECT");
      }),
    /NEXT_REDIRECT/,
  );

  assert.equal(redirectedTo, "/login");
});

void test("resolveLessonPageData calls notFound when lesson query returns null", async () => {
  let triggered = false;

  await assert.rejects(
    async () =>
      resolveLessonPageData(null, () => {
        triggered = true;
        throw new Error("NEXT_NOT_FOUND");
      }),
    /NEXT_NOT_FOUND/,
  );

  assert.equal(triggered, true);
});

void test("shouldShowPaywallOverlay returns true only for premium lessons without an active subscription", () => {
  assert.equal(shouldShowPaywallOverlay({ isFree: false }, false), true);
  assert.equal(shouldShowPaywallOverlay({ isFree: false }, true), false);
  assert.equal(shouldShowPaywallOverlay({ isFree: true }, false), false);
});

void test("shouldShowPaywallOverlay keeps free lessons accessible even when subscription is missing", () => {
  assert.equal(shouldShowPaywallOverlay({ isFree: true }, true), false);
});
