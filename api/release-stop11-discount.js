import { supabaseRequest } from "./_supabase.js";
function respond(res, status, data) {
  res.statusCode = status;
  res.setHeader?.("Content-Type", "application/json");
  res.setHeader?.("Cache-Control", "no-store");
  res.setHeader?.("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(data));
}
async function getBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
  return new Promise(resolve => {
    let raw = "";
    req.on("data", c => raw += c);
    req.on("end", () => { try { resolve(JSON.parse(raw || "{}")); } catch { resolve({}); } });
    req.on("error", () => resolve({})); });
  });
}
export default async function handler(req, res) {
  if (req.method === "OPTIONS") { res.statusCode = 204; res.setHeader?.("Access-Control-Allow-Origin", "*"); return res.end(); }
  if (req.method !== "POST") return respond(res, 405, { error: "Method not allowed" });
  try {
    const body = await getBody(req);
    const orderId = String(body.order_id || "").trim();
    if (!/^order_[A-Za-z0-9]+$/.test(orderId)) return respond(res, 400, { error: "Invalid order." });
    const keyId = process.env.RAZORPAY_KEY_ID, keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return respond(res, 503, { error: "Payment service is not configured." });
    const orders = await supabaseRequest(`orders?select=razorpay_order_id,discount,payment_status&razorpay_order_id=eq.${encodeURIComponent(orderId)}&limit=1`);
    const order = orders?.[0];
    if (!order || order.payment_status !== "pending" || Number(order.discount) <= 0) return respond(res, 200, { released: false });
    const auth = Buffer.from(keyId + ":" + keySecret).toString("base64");
    const paymentRes = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, { headers: { Authorization: "Basic " + auth } });
    const paymentOrder = await paymentRes.json().catch(() => ({}));
    if (!paymentRes.ok) return respond(res, 502, { error: "Could not confirm the payment order status." });
    if (paymentOrder.status !== "created" || Number(paymentOrder.amount_paid || 0) > 0) return respond(res, 200, { released: false });
    const result = await supabaseRequest("rpc/release_stop11_discount", { method: "POST", body: JSON.stringify({ p_order_id: orderId }) });
    const release = Array.isArray(result) ? result[0] : result;
    return respond(res, 200, { released: Boolean(release?.ok) });
  } catch (error) {
    return respond(res, 500, { error: error?.message || "Could not release the discount reservation." });
  }
}
