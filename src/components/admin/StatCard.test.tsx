import assert from "node:assert/strict";

import { render, screen } from "@testing-library/react";
import React from "react";
import { test } from "vitest";

import { StatCard, StatCardsSkeleton } from "./StatCard";

test("StatCard renders title and localized value", () => {
  render(<StatCard title="Total Users" value={1250} icon={<span>icon</span>} />);

  assert.ok(screen.getByText("Total Users"));
  assert.ok(screen.getByText(1250..toLocaleString()));
  assert.ok(screen.getByText("icon"));
});

test("StatCardsSkeleton renders three loading cards", () => {
  const { container } = render(<StatCardsSkeleton />);

  assert.equal(container.querySelectorAll('[data-slot="card"]').length, 3);
  assert.equal(container.querySelectorAll('[data-slot="skeleton"]').length, 6);
});
