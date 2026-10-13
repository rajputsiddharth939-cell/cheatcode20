import { supabaseRequest } from "./_supabase.js";

function respond(res, status, data) {
  res.statusCode = status;
  res.setHeader?.("Content-Type", "application/json");
  res.setHeader?.("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(data));
}

async function getRequestBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.json === "function") return await req.json();
  return new Promise(resolve => {
    let raw = "";
    req.on("data", c => raw += c);
    req.on("end", () => { try { resolve(JSON.parse(raw || "{}")); } catch { resolve({}); } });
    req.on("error", () => resolve({}));
  });
}

const PRICE = 149;
const VALID_FLAVOURS = new Set([
  "Vanilla Crunch", "Guava Chilli", "Belgian Chocolate",
  "Blueberry Cheesecake", "Midnight Cookies"
]);

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader?.("Access-Control-Allow-Origin", "*");
    res.end();
    return;
  }
  if (req.method !== "POST") return respond(res, 405, { error: "Method not allowed" });

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return respond(res, 500, { error: "Razorpay is not configured on the server." });

  try {
    const body = await getRequestBody(req);
    const customer = body.customer || {};
    const items = Array.isArray(body.items) ? body.items : [];
    const founderDelivery = body.founder_delivery === true;
    const discountCode = String(body.discount_code || "").trim().toUpperCase();
    const city = String(customer.city || "").trim();
    if (founderDelivery && city.toLowerCase() !== "ahmedabad") {
      return respond(res, 400, { error: "Founder hand-delivery is available exclusively in Ahmedabad." });
    }

    if (!customer.name || !customer.phone || !customer.address || !customer.pincode) {
      return respond(res, 400, { error: "Name, phone, address and pincode are required." });
    }
    if (!items.length || items.length > 20) return respond(res, 400, { error: "Please select a valid product quantity." });

    const normalized = items.map(item => {
      const name = String(item.name || "").trim();
      const quantity = Number(item.quantity);
      if (!VALID_FLAVOURS.has(name) || !Number.isInteger(quantity) || ![3, 6, 9, 12].includes(quantity)) {
        throw new Error("Invalid product selection.");
      }
      return { name, quantity, price: PRICE };
    });

    const subtotal = normalized.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = discountCode ? Math.round(subtotal * 0.5) : 0;
    const deliveryCharge = founderDelivery ? 5000 : 0;
    const total = subtotal - discountAmount + deliveryCharge;
    const storedItems = founderDelivery ? [...normalized, { name: "Hand-delivered by the Founder", quantity: 1, price: 5000 }] : normalized;
    const amount = total * 100;
    const orderNumber = "CC" + Date.now().toString().slice(-7);
    const receipt = "cc_" + Date.now();

    const auth = Buffer.from(keyId + ":" + keySecret).toString("base64");
    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: "Basic " + auth, "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency: "INR", receipt })
    });
    const data = await rzpResponse.json().catch(() => ({}));

    if (!rzpResponse.ok || !data.id) {
      return respond(res, rzpResponse.status || 500, {
        error: data?.error?.description || "Failed to create Razorpay order."
      });
    }

    if (discountCode) {
      let reservation;
      try {
        const result = await supabaseRequest("rpc/reserve_stop11_discount", { method: "POST", body: JSON.stringify({ p_code: discountCode, p_order_id: data.id }) });
        reservation = Array.isArray(result) ? result[0] : result;
      } catch (error) {
        return respond(res, 400, { error: "This STOP AT 11 code is invalid, already used, or the campaign is not configured." });
      }
      if (!reservation?.ok) return respond(res, 400, { error: "This STOP AT 11 code is invalid, already used, or already reserved." });
    }

    let saved;
    try {
      saved = await supabaseRequest("orders", {
      method: "POST",
      body: JSON.stringify({
        order_number: orderNumber,
        customer_name: String(customer.name).trim(),
        phone: String(customer.phone).trim(),
        email: customer.email ? String(customer.email).trim() : null,
        address: String(customer.address).trim(),
        city,
        state: customer.state ? String(customer.state).trim() : "Gujarat",
        pincode: String(customer.pincode).trim(),
        items: storedItems,
        subtotal,
        discount: discountAmount,
        delivery_charge: deliveryCharge,
        total_amount: total,
        razorpay_order_id: data.id,
        payment_status: "pending",
        order_status: "pending"
      })
    });
    } catch (saveError) {
      if (discountCode) { try { await supabaseRequest("rpc/release_stop11_discount", { method: "POST", body: JSON.stringify({ p_order_id: data.id }) }); } catch {} }
      throw saveError;
    }

    return respond(res, 200, {
      order_id: data.id,
      order_number: orderNumber,
      amount: data.amount,
      currency: data.currency,
      subtotal,
      discount: discountAmount,
      delivery_charge: deliveryCharge,
      total_amount: total,
      discount_code: discountCode || null,
      db_order_id: saved?.[0]?.id || null
    });
  } catch (error) {
    return respond(res, 500, { error: error?.message || "Unable to create order." });
  }
}
