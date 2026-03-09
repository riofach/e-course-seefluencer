import crypto from "node:crypto";

export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  receivedSignature: string,
): boolean {
  if (!receivedSignature) {
    return false;
  }

  const computedHash = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex");

  if (computedHash.length !== receivedSignature.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, "hex"),
      Buffer.from(receivedSignature, "hex"),
    );
  } catch {
    return false;
  }
}
