import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/creators", "/articles", "/feed.xml", "/sitemap.xml", "/ads.txt", "/privacy", "/terms", "/llms.txt"],
        disallow: ["/admin", "/api/", "/auth/"],
      },
    ],
    sitemap: "https://mittified.studio/sitemap.xml",
  };
}
