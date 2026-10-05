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

export default async function handler(req, res) {
  if (!authorized(req)) return reply(res, 401, { error: "Unauthorized" });
  if (req.method !== "GET") return reply(res, 405, { error: "Method not allowed" });

  try {
    const orders = await supabaseRequest(
      "orders?select=*&order=created_at.desc&limit=200",
      { method: "GET", prefer: "return=minimal" }
    );
    return reply(res, 200, { orders });
  } catch (error) {
    return reply(res, 500, { error: error?.message || "Could not load orders." });
  }
}
