import assert from "node:assert/strict";

import { render, screen } from "@testing-library/react";
import React from "react";
import { test } from "vitest";

import { PaywallTeaserOverlay } from "./paywall-teaser-overlay";

test("paywall teaser overlay renders locked content properly", () => {
  render(
    <PaywallTeaserOverlay>
      <p>Hidden premium content</p>
    </PaywallTeaserOverlay>,
  );

  assert.ok(screen.getByText("This lesson is for Pro members"));
  assert.ok(
    screen.getByText(
      "Unlock this lesson and all premium content with a Pro subscription.",
    ),
  );

  const link = screen.getByRole("link", { name: /Upgrade to Pro/i });
  assert.ok(link);
  assert.equal(link.getAttribute("href"), "/pricing");
  assert.ok(screen.getByText("Hidden premium content"));
});

test("paywall teaser overlay does not render children div if no children provided", () => {
  const { container } = render(<PaywallTeaserOverlay />);

  assert.equal(container.querySelector(".blur-sm"), null);
});
