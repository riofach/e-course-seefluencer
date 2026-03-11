import assert from "node:assert/strict";
import { test } from "vitest";

import { handleMidtransWebhookBody } from "./route.shared.ts";

void test("handleMidtransWebhookBody returns 400 for malformed payloads", async () => {
  const result = await handleMidtransWebhookBody({ order_id: "sub_user1_123" }, {
    serverKey: "server-key",
    verifySignature: () => true,
    processWebhook: async () => ({ status: 200, body: { ok: true } }),
  });

  assert.deepEqual(result, {
    status: 400,
    body: { error: "Invalid payload" },
  });
});

void test("handleMidtransWebhookBody returns 401 for invalid signature", async () => {
  const result = await handleMidtransWebhookBody(
    {
      order_id: "sub_user1_123",
      transaction_status: "settlement",
      status_code: "200",
      gross_amount: "99000.00",
      signature_key: "bad-signature",
    },
    {
      serverKey: "server-key",
      verifySignature: () => false,
      processWebhook: async () => ({ status: 200, body: { ok: true } }),
    },
  );

  assert.deepEqual(result, {
    status: 401,
    body: { error: "Unauthorized" },
  });
});

void test("handleMidtransWebhookBody forwards valid settlement payloads", async () => {
  let receivedPayload:
    | {
        orderId: string;
        transactionStatus: string;
      }
    | undefined;

  const result = await handleMidtransWebhookBody(
    {
      order_id: "sub_user1_123",
      transaction_status: "settlement",
      status_code: "200",
      gross_amount: "99000.00",
      signature_key: "valid-signature",
    },
    {
      serverKey: "server-key",
      verifySignature: () => true,
      processWebhook: async (payload) => {
        receivedPayload = payload;
        return { status: 200, body: { ok: true } };
      },
    },
  );

  assert.deepEqual(result, {
    status: 200,
    body: { ok: true },
  });
  assert.deepEqual(receivedPayload, {
    orderId: "sub_user1_123",
    transactionStatus: "settlement",
  });
});

void test("handleMidtransWebhookBody preserves downstream not-found responses", async () => {
  const result = await handleMidtransWebhookBody(
    {
      order_id: "missing-order",
      transaction_status: "settlement",
      status_code: "200",
      gross_amount: "99000.00",
      signature_key: "valid-signature",
    },
    {
      serverKey: "server-key",
      verifySignature: () => true,
      processWebhook: async () => ({
        status: 404,
        body: { error: "Subscription not found" },
      }),
    },
  );

  assert.deepEqual(result, {
    status: 404,
    body: { error: "Subscription not found" },
  });
});
