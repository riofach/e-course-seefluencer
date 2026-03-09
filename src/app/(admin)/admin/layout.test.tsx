import assert from "node:assert/strict";

import { render, screen } from "@testing-library/react";
import React from "react";
import { test, vi } from "vitest";

vi.mock("~/components/admin/AdminHeader", () => ({
  AdminHeader: () => <div>Admin Header</div>,
}));

import AdminLayout from "./layout";

test("AdminLayout renders dashboard shell navigation and children", async () => {
  render(await AdminLayout({ children: <div>Dashboard Body</div> }));

  assert.ok(screen.getByRole("link", { name: /dashboard/i }));
  assert.ok(screen.getByRole("link", { name: /courses/i }));
  assert.ok(screen.getByText("Admin Header"));
  assert.ok(screen.getByText("Dashboard Body"));
});
