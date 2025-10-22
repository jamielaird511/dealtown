import { headers } from "next/headers";

export function getBaseUrl() {
  const h = headers();
  // Works on Vercel and locally
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host  = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) throw new Error("Host header missing");
  return `${proto}://${host}`;
}
