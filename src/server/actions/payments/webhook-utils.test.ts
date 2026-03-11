import assert from "node:assert/strict";
import { test } from "vitest";

import { verifyMidtransSignature } from "./webhook-utils.ts";

void test("verifyMidtransSignature returns true for matching signature", () => {
  const result = verifyMidtransSignature(
    "sub_user123_123456",
    "200",
    "99000.00",
    "server-key",
    "1e59318cac56104f2ec3a03fea42dc9ab565fe44f875fe8c27cf3a758ac684db041e048ed46fdeba1b16f09a05a070751c341b1a118452633522baab636ef2fa",
  );

  assert.equal(result, true);
});

void test("verifyMidtransSignature returns false for incorrect signature", () => {
  const result = verifyMidtransSignature(
    "sub_user123_123456",
    "200",
    "99000.00",
    "server-key",
    "wrong-signature",
  );

  assert.equal(result, false);
});

void test("verifyMidtransSignature returns false for empty signature", () => {
  const result = verifyMidtransSignature(
    "sub_user123_123456",
    "200",
    "99000.00",
    "server-key",
    "",
  );

  assert.equal(result, false);
});
