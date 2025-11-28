import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/panel/", "/vendor/", "/account/", "/auth/", "/api/"],
      },
    ],
    sitemap: "https://cateringle.com/sitemap.xml",
  };
}
