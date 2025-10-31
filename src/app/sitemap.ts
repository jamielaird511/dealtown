import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dealtown.co.nz";
  const now = new Date();
  const routes = [
    "", // home
    "/queenstown",
    "/queenstown/happy-hour",
    "/queenstown/lunch",
    "/queenstown/daily-deals",
  ];
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path ? "daily" : "hourly",
    priority: path ? 0.6 : 0.8,
  }));
}

