import { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/creators", "/articles", "/feed.xml", "/sitemap.xml", "/ads.txt", "/privacy", "/terms", "/llms.txt"],
        disallow: ["/admin", "/api/", "/auth/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
