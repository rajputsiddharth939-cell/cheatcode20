import crypto from "node:crypto";
import { supabaseRequest } from "./_supabase.js";

function respond(res, status, data) {
  res.statusCode = status;
  res.setHeader?.("Content-Type", "application/json");
  res.setHeader?.("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(data));
}

async function getRequestBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.json === "function") return await req.json();
  return new Promise(resolve => {
    let raw = "";
    req.on("data", c => raw += c);
    req.on("end", () => { try { resolve(JSON.parse(raw || "{}")); } catch { resolve({}); } });
    req.on("error", () => resolve({}));
  });
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader?.("Access-Control-Allow-Origin", "*");
    res.end();
    return;
  }
  if (req.method !== "POST") return respond(res, 405, { error: "Method not allowed" });

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) return respond(res, 500, { error: "Razorpay verification is not configured on the server." });

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await getRequestBody(req);
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return respond(res, 400, { error: "Missing payment verification fields." });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    const expected = Buffer.from(expectedSignature, "utf8");
    const received = Buffer.from(String(razorpay_signature), "utf8");
    const valid = expected.length === received.length && crypto.timingSafeEqual(expected, received);

    if (!valid) return respond(res, 400, { verified: false, error: "Payment signature mismatch." });

    await supabaseRequest(
      "orders?razorpay_order_id=eq." + encodeURIComponent(razorpay_order_id),
      {
        method: "PATCH",
        body: JSON.stringify({
          razorpay_payment_id,
          payment_status: "paid",
          order_status: "processing"
        })
      }
    );

    return respond(res, 200, { verified: true });
  } catch (error) {
    return respond(res, 500, { verified: false, error: error?.message || "Verification error" });
  }
}
