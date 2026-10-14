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

// Keep in sync with CONFIG in index.html
const PRICE = 99;
const PACK_SIZES = new Set([3, 6, 9, 12]);
const DELIVERY_FEE = 60;
const FREE_DELIVERY_FROM = 9;
const FLAVOURS = {
  "vanilla-crunch": "Vanilla Crunch", "guava-chilli": "Guava Chilli", "belgian-chocolate": "Belgian Chocolate",
  "blueberry-cheesecake": "Blueberry Cheesecake", "midnight-cookies": "Midnight Cookies"
};
const VALID_FLAVOURS = new Set(Object.values(FLAVOURS));
const OUT_OF_STOCK = { "vanilla-crunch": "Vanilla Crunch" };
const hasOutOfStock = item =>
  Object.entries(OUT_OF_STOCK).some(([slug, name]) =>
    String(item.name || "").trim() === name || item.slug === slug || item.items?.[slug] > 0);

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

    if (!customer.name || !customer.phone || !customer.address || !customer.pincode) {
      return respond(res, 400, { error: "Name, phone, address and pincode are required." });
    }
    if (!items.length || items.length > 20) return respond(res, 400, { error: "Please select a valid product quantity." });
    if (items.some(hasOutOfStock)) return respond(res, 400, { error: "Vanilla Crunch is out of stock. Please remove it from your cart." });

    const normalized = items.map(item => {
      const quantity = Number(item.quantity);
      if (!PACK_SIZES.has(quantity)) throw new Error("Invalid product selection.");
      if (item.type === "box") {
        const mix = Object.entries(item.items && typeof item.items === "object" ? item.items : {});
        const valid = mix.length && mix.every(([slug, n]) => FLAVOURS[slug] && Number.isInteger(n) && n > 0)
          && mix.reduce((sum, [, n]) => sum + n, 0) === quantity;
        if (!valid) throw new Error("Invalid product selection.");
        return { name: "Custom Box", quantity, price: PRICE, flavours: Object.fromEntries(mix.map(([slug, n]) => [FLAVOURS[slug], n])) };
      }
      const name = String(item.name || "").trim();
      if (!VALID_FLAVOURS.has(name)) throw new Error("Invalid product selection.");
      return { name, quantity, price: PRICE };
    });

    const tubs = normalized.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = tubs * PRICE;
    const deliveryCharge = tubs >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
    const total = subtotal + deliveryCharge;
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

    const saved = await supabaseRequest("orders", {
      method: "POST",
      body: JSON.stringify({
        order_number: orderNumber,
        customer_name: String(customer.name).trim(),
        phone: String(customer.phone).trim(),
        email: customer.email ? String(customer.email).trim() : null,
        address: String(customer.address).trim(),
        city: customer.city ? String(customer.city).trim() : "Ahmedabad",
        state: customer.state ? String(customer.state).trim() : "Gujarat",
        pincode: String(customer.pincode).trim(),
        items: normalized,
        subtotal,
        discount: 0,
        delivery_charge: deliveryCharge,
        total_amount: total,
        razorpay_order_id: data.id,
        payment_status: "pending",
        order_status: "pending"
      })
    });

    return respond(res, 200, {
      order_id: data.id,
      order_number: orderNumber,
      amount: data.amount,
      currency: data.currency,
      db_order_id: saved?.[0]?.id || null
    });
  } catch (error) {
    return respond(res, 500, { error: error?.message || "Unable to create order." });
  }
}
