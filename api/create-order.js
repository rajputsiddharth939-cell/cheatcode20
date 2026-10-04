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

  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return respond(res, 500, { error: "Razorpay is not configured on the server." });
  }

  try {
    const body = await getRequestBody(req);
    const amount = Number(body.amount);
    const currency = String(body.currency || "INR").toUpperCase();
    const receipt = String(body.receipt || "cc_" + Date.now());

    if (!Number.isInteger(amount) || amount < 100) {
      return respond(res, 400, { error: "Amount must be at least 100 paise (₹1)." });
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt,
      }),
    });

    const data = await rzpResponse.json().catch(() => ({}));

    if (!rzpResponse.ok || !data.id) {
      const errMsg = data?.error?.description || data?.message || "Failed to create Razorpay order";
      return respond(res, rzpResponse.status || 500, { error: errMsg });
    }

    return respond(res, 200, {
      order_id: data.id,
      amount: data.amount,
      currency: data.currency,
    });
  } catch (error) {
    return respond(res, 500, {
      error: error?.message || "Unable to create Razorpay order.",
    });
  }
}
