import crypto from "node:crypto";
import { supabaseRequest } from "./_supabase.js";

function getRawBody(req) {
  if (Buffer.isBuffer(req.body)) return Promise.resolve(req.body.toString("utf8"));
  if (typeof req.body === "string") return Promise.resolve(req.body);
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function reply(res, status, data) {
  res.statusCode = status;
  res.setHeader?.("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return reply(res, 405, { error: "Method not allowed" });

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return reply(res, 500, { error: "Webhook secret is not configured." });

  try {
    const raw = await getRawBody(req);
    const signature = req.headers["x-razorpay-signature"];
    if (!signature) return reply(res, 400, { error: "Missing Razorpay signature." });

    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    const valid = expected.length === String(signature).length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(signature)));
    if (!valid) return reply(res, 400, { error: "Invalid webhook signature." });

    const event = JSON.parse(raw);
    const payment = event?.payload?.payment?.entity;
    const orderId = payment?.order_id;

    if (event.event === "payment.captured" && orderId) {
      await supabaseRequest(
        `orders?razorpay_order_id=eq.${encodeURIComponent(orderId)}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            razorpay_payment_id: payment.id || null,
            payment_status: "paid",
            order_status: "processing",
          }),
        }
      );
    }

    if (event.event === "payment.failed" && orderId) {
      await supabaseRequest(
        `orders?razorpay_order_id=eq.${encodeURIComponent(orderId)}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            payment_status: "failed",
            order_status: "payment_failed",
          }),
        }
      );
    }

    return reply(res, 200, { received: true });
  } catch (error) {
    return reply(res, 500, { error: error?.message || "Webhook processing failed." });
  }
}
