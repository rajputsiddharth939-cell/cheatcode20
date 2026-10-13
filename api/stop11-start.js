import crypto from "node:crypto";
import { stop11Config, campaignCount, dbRequest, hmac, readCookie, verifyVisitorId, signVisitorId, signAttempt, respond } from "./_stop11.js";
function parseBody(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  return new Promise(resolve => { let raw = ""; req.on("data", c => raw += c); req.on("end", () => { try { resolve(JSON.parse(raw || "{}")); } catch { resolve({}); } }); req.on("error", () => resolve({}); });
}
function cookie(res, value) { res.setHeader("Set-Cookie", `cc_stop11_id=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`); }
async function existingAttempt(config, visitorHash) {
  const rows = await dbRequest(`stop11_attempts?select=id,status,elapsed_ms,is_winner,token_nonce&visitor_hash=eq.${encodeURIComponent(visitorHash)}&limit=1`, config);
  return rows[0] || null;
}
async function priorWin(config, attemptId) {
  const rows = await dbRequest(`stop11_winners?select=code,status&attempt_id=eq.${encodeURIComponent(attemptId)}&limit=1`, config);
  return rows[0] || null;
}
export default async function handler(req, res) {
  if (req.method === "OPTIONS") { res.statusCode = 204; res.setHeader("Access-Control-Allow-Origin", "*"); return res.end(); }
  if (req.method !== "POST") return respond(res, 405, { error: "Method not allowed" });
  try {
    const config = stop11Config();
    const rawCookie = readCookie(req, "cc_stop11_id");
    let visitorId = verifyVisitorId(rawCookie, config.secret);
    if (!visitorId) { visitorId = crypto.randomUUID(); cookie(res, signVisitorId(visitorId, config.secret)); }
    const visitorHash = hmac(config.secret, `visitor:${visitorId}`);
    const campaign = await campaignCount(config);
    const previous = await existingAttempt(config, visitorHash);
    if (previous) {
      const win = await priorWin(config, previous.id);
      const recoverable = win?.status === "available";
      return respond(res, 200, { already_attempted: true, won: Boolean(recoverable), discount_code: recoverable ? win.code : null, claimed_count: campaign.claimed_count, sold_out: !campaign.available });
    }
    if (!campaign.available) return respond(res, 200, { sold_out: true, claimed_count: campaign.claimed_count, already_attempted: false });
    const nonce = crypto.randomBytes(24).toString("base64url");
    let inserted;
    try {
      inserted = await dbRequest("stop11_attempts", { ...config, method: "POST", prefer: "return=representation", body: [{ visitor_hash: visitorHash, token_nonce: nonce, status: "started" }] });
    } catch (error) {
      const raced = await existingAttempt(config, visitorHash);
      if (raced) return respond(res, 200, { already_attempted: true, claimed_count: campaign.claimed_count });
      throw error;
    }
    if (!inserted[0]?.id) throw new Error("Could not reserve your one attempt.");
    const token = signAttempt({ id: inserted[0].id, visitor_hash: visitorHash, nonce, exp: Date.now() + 60 * 60 * 1000 }, config.secret);
    return respond(res, 200, { attempt_token: token, claimed_count: campaign.claimed_count });
  } catch (error) {
    return respond(res, 503, { error: error?.message || "STOP AT 11 is not configured." });
  }
}
