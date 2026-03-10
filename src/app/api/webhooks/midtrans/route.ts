import { NextResponse } from "next/server";

import { env } from "~/env";
import { processMidtransWebhook } from "~/server/actions/payments/process-webhook";
import { verifyMidtransSignature } from "~/server/actions/payments/webhook-utils";

import { handleMidtransWebhookBody } from "./route.shared";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);
    const result = await handleMidtransWebhookBody(body, {
      serverKey: env.MIDTRANS_SERVER_KEY ?? "",
      verifySignature: verifyMidtransSignature,
      processWebhook: processMidtransWebhook,
    });

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
