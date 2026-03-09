import assert from "node:assert/strict";

import type { NextRequest, NextResponse } from "next/server";
import { test, vi } from "vitest";

type MiddlewareHandler = (req: NextRequest & {
  nextauth: { token: { role?: string } | null };
}) => NextResponse;

type WithAuthOptions = {
  callbacks?: {
    authorized?: (args: { token: unknown }) => boolean;
  };
};

const withAuthSpy = vi.fn(
  (handler: MiddlewareHandler, options?: WithAuthOptions) => {
    Reflect.set(handler, "__options", options);
    return handler;
  },
);

vi.mock("next-auth/middleware", () => ({
  withAuth: withAuthSpy,
}));

const importedMiddleware = (await import("./middleware")).default;
const { config } = await import("./middleware");
const middleware = importedMiddleware as unknown as MiddlewareHandler;

test("middleware config protects /admin routes", () => {
  assert.ok(config.matcher.includes("/admin/:path*"));
});

test("middleware redirects non-admin users away from /admin", () => {
  const response = middleware({
    nextauth: { token: { role: "student" } },
    nextUrl: { pathname: "/admin" },
    url: "http://localhost:3000/admin",
  } as NextRequest & { nextauth: { token: { role: string } } });

  assert.equal(response.headers.get("location"), "http://localhost:3000/");
});

test("middleware allows admin users to continue to /admin", () => {
  const response = middleware({
    nextauth: { token: { role: "admin" } },
    nextUrl: { pathname: "/admin" },
    url: "http://localhost:3000/admin",
  } as NextRequest & { nextauth: { token: { role: string } } });

  assert.equal(response.headers.get("location"), null);
});

test("middleware requires authentication for protected routes", () => {
  const options = Reflect.get(middleware, "__options") as WithAuthOptions;

  assert.equal(options.callbacks?.authorized?.({ token: null }), false);
  assert.equal(options.callbacks?.authorized?.({ token: { sub: "user-1" } }), true);
});
