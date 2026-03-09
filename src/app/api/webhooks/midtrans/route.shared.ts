import type { ProcessWebhookResult } from "~/server/actions/payments/process-webhook.shared.ts";

import { webhookPayloadSchema } from "./webhook-payload.schema.ts";

type HandleWebhookDependencies = {
  serverKey: string;
  verifySignature: (
    orderId: string,
    statusCode: string,
    grossAmount: string,
    serverKey: string,
    receivedSignature: string,
  ) => boolean;
  processWebhook: (payload: {
    orderId: string;
    transactionStatus: string;
  }) => Promise<ProcessWebhookResult>;
};

export async function handleMidtransWebhookBody(
  body: unknown,
  dependencies: HandleWebhookDependencies,
): Promise<ProcessWebhookResult> {
  const parsed = webhookPayloadSchema.safeParse(body);

  if (!parsed.success) {
    return {
      status: 400,
      body: { error: "Invalid payload" },
    };
  }

  const {
    order_id,
    transaction_status,
    status_code,
    gross_amount,
    signature_key,
  } = parsed.data;

  const isValid = dependencies.verifySignature(
    order_id,
    status_code,
    gross_amount,
    dependencies.serverKey,
    signature_key,
  );

  if (!isValid) {
    return {
      status: 401,
      body: { error: "Unauthorized" },
    };
  }

  return dependencies.processWebhook({
    orderId: order_id,
    transactionStatus: transaction_status,
  });
}
