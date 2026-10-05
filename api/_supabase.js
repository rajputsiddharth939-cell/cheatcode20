const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function requireSupabase() {
  if (!url || !key) throw new Error("Supabase is not configured on the server.");
  return { url: url.replace(/\/$/, ""), key };
}

export async function supabaseRequest(path, options = {}) {
  const { url, key } = requireSupabase();
  const response = await fetch(url + "/rest/v1/" + path, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!response.ok) {
    const message = data?.message || data?.hint || data?.details || "Supabase request failed.";
    throw new Error(message);
  }
  return data;
}
