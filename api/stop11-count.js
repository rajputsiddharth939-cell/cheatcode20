import { stop11Config, campaignCount, respond } from "./_stop11.js";
export default async function handler(req, res) {
  if (req.method === "OPTIONS") { res.statusCode = 204; res.setHeader("Access-Control-Allow-Origin", "*"); return res.end(); }
  if (req.method !== "GET") return respond(res, 405, { error: "Method not allowed" });
  try {
    const config = stop11Config();
    const campaign = await campaignCount(config);
    return respond(res, 200, { claimed_count: campaign.claimed_count, max_winners: campaign.max_winners, available: campaign.available });
  } catch (error) {
    return respond(res, 503, { error: error?.message || "STOP AT 11 is not available." });
  }
}
