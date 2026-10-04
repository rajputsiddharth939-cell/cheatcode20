import crypto from "node:crypto";

if (typeof process.loadEnvFile === "function") {
  try { process.loadEnvFile(); } catch (_) {}
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function getRequestBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.json === "function") {
    try {
      return await req.json();
    } catch {
      return {};
    }
  }
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

function respond(res, status, data) {
  const bodyStr = JSON.stringify(data);
  if (res && typeof res.writeHead === "function") {
    res.writeHead(status, { "Content-Type": "application/json", ...corsHeaders });
    return res.end(bodyStr);
  }
  return new Response(bodyStr, {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export default async function handler(req, res) {
  const method = req.method || (req instanceof Request ? req.method : "POST");

  if (method === "OPTIONS") {
    if (res && typeof res.writeHead === "function") {
      res.writeHead(204, corsHeaders);
      return res.end();
    }
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (method !== "POST") {
    return respond(res, 405, { error: "Method not allowed" });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return respond(res, 500, { error: "Razorpay verification is not configured on the server." });
  }

  try {
    const body = await getRequestBody(req);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return respond(res, 400, { error: "Missing payment verification fields." });
    }

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    const expected = Buffer.from(expectedSignature, "utf8");
    const received = Buffer.from(String(razorpay_signature), "utf8");

    const valid =
      expected.length === received.length &&
      crypto.timingSafeEqual(expected, received);

    if (!valid) {
      return respond(res, 400, { verified: false, error: "Payment signature mismatch." });
    }

    return respond(res, 200, { verified: true });
  } catch (error) {
    return respond(res, 500, { verified: false, error: error?.message || "Verification error" });
  }
}
