import { z } from "zod";

const stringOrNumber = z
  .union([z.string(), z.number()])
  .transform((v) => String(v));

export const webhookPayloadSchema = z.object({
  order_id: stringOrNumber,
  transaction_status: stringOrNumber,
  status_code: stringOrNumber,
  gross_amount: stringOrNumber,
  signature_key: stringOrNumber,
  fraud_status: z
    .union([z.string(), z.number()])
    .transform((v) => String(v))
    .optional(),
  payment_type: z
    .union([z.string(), z.number()])
    .transform((v) => String(v))
    .optional(),
});

export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
