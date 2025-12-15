import { MetadataRoute } from "next";

const BASE_URL = "https://cateringle.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/panel/",      // Admin panel
          "/vendor/",     // Vendor panel
          "/account/",    // User account
          "/api/",        // API routes
          "/auth/callback", // Auth callbacks
          "/unsubscribe", // Email unsubscribe
        ],
      },
      {
        userAgent: "GPTBot",
        disallow: ["/"], // Block ChatGPT crawler
      },
      {
        userAgent: "CCBot",
        disallow: ["/"], // Block Common Crawl
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
