import crypto from "node:crypto";
import { stop11Config, campaignCount, dbRequest, readCookie, verifyVisitorId, hmac, verifyAttempt, respond } from "./_stop11.js";
async function getBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  return new Promise(resolve => { let raw = ""; req.on("data", c => raw += c); req.on("end", () => { try { resolve(JSON.parse(raw || "{}")); } catch { resolve({}); } }); req.on("error", () => resolve({})); });
}
export default async function handler(req, res) {
  if (req.method === "OPTIONS") { res.statusCode = 204; res.setHeader("Access-Control-Allow-Origin", "*"); return res.end(); }
  if (req.method !== "POST") return respond(res, 405, { error: "Method not allowed" });
  try {
    const config = stop11Config();
    const body = await getBody(req);
    const payload = verifyAttempt(body.attempt_token, config.secret);
    const visitorId = verifyVisitorId(readCookie(req, "cc_stop11_id"), config.secret);
    if (!payload || !visitorId || payload.visitor_hash !== hmac(config.secret, `visitor:${visitorId}`)) return respond(res, 400, { error: "Your signed attempt token is invalid or expired. Your attempt cannot be replayed." });
    const elapsed = Number(body.elapsed_ms);
    if (!Number.isFinite(elapsed) || elapsed < 0 || elapsed > 120000) return respond(res, 400, { error: "Invalid elapsed time." });
    const code = `CC11-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const resultData = await dbRequest("rpc/submit_stop11_attempt", { ...config, method: "POST", body: { p_attempt_id: payload.id, p_visitor_hash: payload.visitor_hash, p_token_nonce: payload.nonce, p_elapsed_ms: elapsed, p_discount_code: code } });
    const result = Array.isArray(resultData) ? resultData[0] : resultData;
    const campaign = await campaignCount(config);
    if (!result?.ok) return respond(res, 409, { error: result?.reason === "already_used" ? "This attempt has already been submitted." : "Your attempt could not be recorded." , claimed_count: campaign.claimed_count });
    return respond(res, 200, { won: Boolean(result.won), discount_code: result.won ? result.code : null, elapsed_ms: elapsed, claimed_count: campaign.claimed_count, reason: result.reason || null });
  } catch (error) {
    return respond(res, 503, { error: error?.message || "Could not submit your attempt." });
  }
}
