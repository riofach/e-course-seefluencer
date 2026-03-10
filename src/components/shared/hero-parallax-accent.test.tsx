import assert from "node:assert/strict";

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, test, vi } from "vitest";

import { HeroParallaxAccent } from "./hero-parallax-accent";

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockReturnValue({
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

test("renders decorative layers as aria-hidden progressive enhancement", () => {
  const { container } = render(<HeroParallaxAccent />);

  const accentRoot = container.querySelector('[aria-hidden="true"]');

  assert.ok(accentRoot);
  assert.equal(screen.queryByRole("img"), null);
});

test("suppresses motion listener when reduced motion is enabled", () => {
  const addEventListenerSpy = vi.spyOn(window, "addEventListener");

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockReturnValue({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });

  render(<HeroParallaxAccent />);

  assert.equal(addEventListenerSpy.mock.calls.length, 0);
});
