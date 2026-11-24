import type { MetadataRoute } from "next";

// Indeksowanie tylko na produkcji Vercel; staging/preview pozostaje noindex.
export default function robots(): MetadataRoute.Robots {
  const prod = process.env.VERCEL_ENV === "production";
  return { rules: prod ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" } };
}
