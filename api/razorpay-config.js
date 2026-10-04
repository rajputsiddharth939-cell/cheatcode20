if (typeof process.loadEnvFile === "function") {
  try { process.loadEnvFile(); } catch (_) {}
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export default async function handler(req, res) {
  const method = req.method || (req instanceof Request ? req.method : "GET");
  if (method === "OPTIONS") {
    if (res && typeof res.writeHead === "function") {
      res.writeHead(204, corsHeaders);
      return res.end();
    }
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (method !== "GET") {
    const errBody = JSON.stringify({ error: "Method not allowed" });
    if (res && typeof res.writeHead === "function") {
      res.writeHead(405, { "Content-Type": "application/json", ...corsHeaders });
      return res.end(errBody);
    }
    return new Response(errBody, { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }

  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  if (!keyId) {
    const errBody = JSON.stringify({ error: "Razorpay is not configured on the server." });
    if (res && typeof res.writeHead === "function") {
      res.writeHead(500, { "Content-Type": "application/json", ...corsHeaders });
      return res.end(errBody);
    }
    return new Response(errBody, { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }

  const successBody = JSON.stringify({ key_id: keyId });
  if (res && typeof res.writeHead === "function") {
    res.writeHead(200, { "Content-Type": "application/json", ...corsHeaders });
    return res.end(successBody);
  }
  return new Response(successBody, { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
}
