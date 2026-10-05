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

function supabaseConfig() {
  return {
    url: String(process.env.SUPABASE_URL || "").replace(/\/$/, ""),
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
}

async function saveOrder(orderData, payment) {
  const { url, key } = supabaseConfig();
  if (!url || !key) return { saved: false, skipped: true };

  const customer = orderData?.customer || {};
  const items = Array.isArray(orderData?.items) ? orderData.items : [];
  const total = Number(orderData?.total_amount);
  const subtotal = Number(orderData?.subtotal);
  const delivery = Number(orderData?.delivery_charge);

  if (!customer.name || !customer.phone || !customer.email || !customer.address || !customer.city || !customer.pincode) {
    throw new Error("Order customer details are incomplete.");
  }
  if (!items.length || !Number.isFinite(total) || !Number.isFinite(subtotal) || !Number.isFinite(delivery)) {
    throw new Error("Order details are incomplete.");
  }

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };

  const existingRes = await fetch(
    `${url}/rest/v1/orders?select=id,order_number&razorpay_payment_id=eq.${encodeURIComponent(payment.payment_id)}&limit=1`,
    { headers }
  );
  if (!existingRes.ok) throw new Error("Could not check existing order.");
  const existing = await existingRes.json();
  if (existing[0]) return { saved: true, duplicate: true, order_number: existing[0].order_number };

  const now = new Date();
  const stamp = now.toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const random = crypto.randomBytes(3).toString("hex").toUpperCase();
  const orderNumber = `CC-${stamp}-${random}`;

  const payload = {
    order_number: orderNumber,
    customer_name: String(customer.name).trim(),
    phone: String(customer.phone).trim(),
    email: String(customer.email).trim(),
    address: String(customer.address).trim(),
    city: String(customer.city).trim(),
    state: customer.state ? String(customer.state).trim() : null,
    pincode: String(customer.pincode).trim(),
    items,
    subtotal,
    discount: Number(orderData.discount || 0),
    delivery_charge: delivery,
    total_amount: total,
    razorpay_order_id: payment.order_id,
    razorpay_payment_id: payment.payment_id,
    payment_status: "paid",
    order_status: "new",
  };

  const insertRes = await fetch(`${url}/rest/v1/orders`, {
    method: "POST",
    headers: { ...headers, Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  if (!insertRes.ok) {
    const detail = await insertRes.text();
    throw new Error(`Order could not be saved: ${detail.slice(0, 300)}`);
  }

  return { saved: true, duplicate: false, order_number: orderNumber };
}

export default async function handler(req) {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_data } =
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

  try {
    const saved = await saveOrder(order_data, {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
    });
    return json({ verified: true, order_saved: saved.saved, order_number: saved.order_number || null });
  } catch (error) {
    return json({ verified: false, error: error?.message || "Payment verified, but the order could not be saved. Please contact support." }, 500);
  }
}
