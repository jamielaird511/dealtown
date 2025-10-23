export function getCampaign() {
  const p = new URLSearchParams(location.search);
  const keys = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"];
  const existing = JSON.parse(localStorage.getItem("dt_campaign") || "{}");
  if (keys.some(k => p.get(k))) {
    const c = Object.fromEntries(keys.map(k => [k, p.get(k)]));
    localStorage.setItem("dt_campaign", JSON.stringify(c));
    return c;
  }
  return existing;
}
