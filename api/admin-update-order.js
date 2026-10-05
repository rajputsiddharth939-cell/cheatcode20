import { supabaseRequest } from "./_supabase.js";

function reply(res, status, data) {
  res.statusCode = status;
  res.setHeader?.("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function authorized(req) {
  const configured = process.env.ADMIN_PASSWORD;
  const supplied = req.headers["x-admin-password"];
  return Boolean(configured && supplied && supplied === configured);
}

async function body(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.json === "function") return await req.json();
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", c => raw += c);
    req.on("end", () => { try { resolve(JSON.parse(raw || "{}")); } catch (e) { reject(e); } });
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (!authorized(req)) return reply(res, 401, { error: "Unauthorized" });
  if (req.method !== "PATCH") return reply(res, 405, { error: "Method not allowed" });

  try {
    const { order_id, order_status } = await body(req);
    const allowed = ["processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"];
    if (!order_id || !allowed.includes(order_status)) {
      return reply(res, 400, { error: "Invalid order or status." });
    }
    const orders = await supabaseRequest(
      `orders?id=eq.${encodeURIComponent(order_id)}`,
      { method: "PATCH", body: JSON.stringify({ order_status }) }
    );
    return reply(res, 200, { order: orders?.[0] || null });
  } catch (error) {
    return reply(res, 500, { error: error?.message || "Could not update order." });
  }
}
