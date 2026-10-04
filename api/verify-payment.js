import crypto from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export default async function handler(req) {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    await req.json().catch(() => ({}));

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return json({ error: "Missing payment verification fields." }, 400);
  }

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return json({ error: "Razorpay verification is not configured on the server." }, 500);
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  const expected = Buffer.from(expectedSignature, "utf8");
  const received = Buffer.from(String(razorpay_signature), "utf8");

  const valid =
    expected.length === received.length &&
    crypto.timingSafeEqual(expected, received);

  if (!valid) {
    return json({ verified: false, error: "Payment signature mismatch." }, 400);
  }

  return json({ verified: true });
}
