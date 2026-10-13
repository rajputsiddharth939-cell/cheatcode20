import crypto from "node:crypto";

export function stop11Config() {
  const url = String(process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const secret = process.env.STOP11_SIGNING_SECRET;
  if (!url || !key || !secret || secret.length < 32) throw new Error("STOP AT 11 campaign is not configured. Apply the Supabase migration and set STOP11_SIGNING_SECRET.");
  return { url, key, secret };
}
export function hmac(secret, value) {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}
export function timingSafeEqual(a, b) {
  const aa = Buffer.from(String(a || ""), "utf8"), bb = Buffer.from(String(b || ""), "utf8");
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
export function readCookie(req, name) {
  const header = String(req.headers?.cookie || "");
  for (const pair of header.split(";")) {
    const at = pair.indexOf("=");
    if (at < 0) continue;
    if (pair.slice(0, at).trim() === name) return decodeURIComponent(pair.slice(at + 1).trim());
  }
  return "";
}
export function signVisitorId(id, secret) { return `${id}.${hmac(secret, `visitor-cookie:${id}`)}`; }
export function verifyVisitorId(value, secret) {
  const at = value.lastIndexOf(".");
  if (at < 1) return null;
  const id = value.slice(0, at), signature = value.slice(at + 1);
  if (!/^[0-9a-f-]{36}$/i.test(id) || !timingSafeEqual(signature, hmac(secret, `visitor-cookie:${id}`))) return null;
  return id;
}
export function signAttempt(payload, secret) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${hmac(secret, `attempt:${encoded}`)}`;
}
export function verifyAttempt(token, secret) {
  const at = String(token || "").lastIndexOf(".");
  if (at < 1) return null;
  const encoded = token.slice(0, at), signature = token.slice(at + 1);
  if (!timingSafeEqual(signature, hmac(secret, `attempt:${encoded}`))) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!payload.id || !payload.visitor_hash || !payload.nonce || !Number.isFinite(payload.exp) || payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}
export async function dbRequest(path, { url, key, method = "GET", body, prefer } = {}) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(prefer ? { Prefer: prefer } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  if (!response.ok) throw new Error(data?.message || data?.hint || data?.details || "Supabase request failed.");
  return data;
}
export async function campaignCount(config) {
  const rows = await dbRequest("stop11_campaigns?select=claimed_count,max_winners,enabled,tolerance_ms&id=eq.1&limit=1", config);
  if (!rows[0]) throw new Error("STOP AT 11 migration has not been applied.");
  return { claimed_count: Number(rows[0].claimed_count), max_winners: Number(rows[0].max_winners), available: Boolean(rows[0].enabled) && Number(rows[0].claimed_count) < Number(rows[0].max_winners), tolerance_ms: Number(rows[0].tolerance_ms) };
}
export function respond(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(data));
}
