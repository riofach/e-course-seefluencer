import assert from "node:assert/strict";

import { render, screen } from "@testing-library/react";
import { test, vi } from "vitest";

import { AdminHeaderContent } from "./AdminHeaderContent";

vi.mock("~/components/shared/logout-button", () => ({
  LogoutButton: () => <button type="button">Sign Out</button>,
}));

test("AdminHeaderContent renders signed-in admin identity and sign-out action", () => {
  render(
    <AdminHeaderContent
      displayName="Rio Admin"
      email="rio@example.com"
    />,
  );

  assert.ok(screen.getByText("Rio Admin"));
  assert.ok(screen.getByRole("button", { name: /rio admin/i }));
});
