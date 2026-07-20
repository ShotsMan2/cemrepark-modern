import crypto from "crypto";
import logger from "../lib/logger";
import { withRetry } from "../lib/retry";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "super-secret-key";

export async function dispatchWebhook(url, payload) {
  const payloadString = JSON.stringify(payload);
  const signature = crypto.createHmac("sha256", WEBHOOK_SECRET).update(payloadString).digest("hex");

  const sendWebhook = async () => {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CemrePark-Signature": signature,
      },
      body: payloadString,
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }
    return response.json();
  };

  try {
    // Attempt to send webhook with exponential backoff (max 3 retries)
    await withRetry(sendWebhook, 3, 1000);
    logger.info(`[Webhook] Successfully dispatched payload to ${url}`);
  } catch (error) {
    logger.error(`[Webhook] Failed to dispatch payload to ${url} after retries:`, error);
  }
}
