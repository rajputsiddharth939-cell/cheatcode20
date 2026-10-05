const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export default async function handler(req) {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  const adminKey = process.env.ORDERS_ADMIN_KEY;
  if (!adminKey || req.headers.get("x-admin-key") !== adminKey) {
    return json({ error: "Unauthorized" }, 401);
  }

  const url = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return json({ error: "Supabase is not configured on the server." }, 500);

  const limit = Math.min(Math.max(Number(req.nextUrl?.searchParams?.get("limit") || 100), 1), 500);
  const headers = { apikey: key, Authorization: `Bearer ${key}` };
  const response = await fetch(
    `${url}/rest/v1/orders?select=*&order=created_at.desc&limit=${limit}`,
    { headers }
  );

  if (!response.ok) {
    const detail = await response.text();
    return json({ error: `Unable to load orders: ${detail.slice(0, 300)}` }, 500);
  }

  return json({ orders: await response.json() });
}
