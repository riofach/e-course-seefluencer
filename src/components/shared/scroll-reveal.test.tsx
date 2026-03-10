import assert from "node:assert/strict";

import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, test, vi } from "vitest";

import { ScrollReveal } from "./scroll-reveal";

type ObserverCallback = ConstructorParameters<typeof IntersectionObserver>[0];

const observerState: {
  callback: ObserverCallback | null;
  observe: ReturnType<typeof vi.fn>;
  unobserve: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
  animate: ReturnType<typeof vi.fn>;
} = {
  callback: null,
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  animate: vi.fn(),
};

beforeEach(() => {
  observerState.callback = null;
  observerState.observe = vi.fn();
  observerState.unobserve = vi.fn();
  observerState.disconnect = vi.fn();
  observerState.animate = vi.fn();

  Object.defineProperty(HTMLElement.prototype, "animate", {
    configurable: true,
    writable: true,
    value: observerState.animate,
  });

  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  );

  vi.stubGlobal(
    "IntersectionObserver",
    vi.fn((callback: ObserverCallback) => {
      observerState.callback = callback;

      return {
        observe: observerState.observe,
        unobserve: observerState.unobserve,
        disconnect: observerState.disconnect,
        root: null,
        rootMargin: "0px",
        thresholds: [0.1],
        takeRecords: () => [],
      };
    }),
  );

  Object.defineProperty(window, "IntersectionObserver", {
    configurable: true,
    writable: true,
    value: globalThis.IntersectionObserver,
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test("renders wrapped content without hiding it by default", () => {
  render(
    <ScrollReveal>
      <section>
        <h2>Visible marketing content</h2>
      </section>
    </ScrollReveal>,
  );

  assert.ok(screen.getByRole("heading", { name: /visible marketing content/i }));
});

test("reads reduced-motion preference before applying reveal behavior", () => {
  const matchMediaMock = vi.fn().mockReturnValue({
    matches: false,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });

  vi.stubGlobal("matchMedia", matchMediaMock);
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: matchMediaMock,
  });

  render(
    <ScrollReveal delay={80}>
      <div>Animated section</div>
    </ScrollReveal>,
  );

  assert.ok(screen.getByText("Animated section"));
  assert.equal(matchMediaMock.mock.calls.at(0)?.[0], "(prefers-reduced-motion: reduce)");
});

test("skips animation when reduced motion is enabled", () => {
  const matchMediaMock = vi.fn().mockReturnValue({
    matches: true,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });

  vi.stubGlobal("matchMedia", matchMediaMock);

  render(
    <ScrollReveal>
      <div>Reduced motion section</div>
    </ScrollReveal>,
  );

  assert.equal(observerState.observe.mock.calls.length, 0);
});
