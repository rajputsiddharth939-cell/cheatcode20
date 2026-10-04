import Razorpay from "razorpay";

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

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return json({ error: "Razorpay is not configured on the server." }, 500);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const amount = Number(body.amount);
    const currency = String(body.currency || "INR").toUpperCase();
    const receipt = String(body.receipt || "cheatcode-" + Date.now());

    if (!Number.isInteger(amount) || amount < 100) {
      return json({ error: "Amount must be at least 100 paise." }, 400);
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
    });

    return json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    const status = error?.statusCode === 401 || error?.statusCode === 40100 ? 401 : 500;
    return json({ error: error?.error?.description || error?.message || "Unable to create Razorpay order." }, status);
  }
}
