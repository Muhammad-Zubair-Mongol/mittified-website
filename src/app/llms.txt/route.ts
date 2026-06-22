import { NextResponse } from "next/server";
import { getArticles, getCreators } from "@/lib/db";
import { BASE_URL } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  // Fetch top 30 creators and latest 30 articles to prevent overwhelming LLM contexts
  const articles = await getArticles(30);
  const creators = await getCreators(30);

  const baseUrl = BASE_URL;

  // Build Markdown Summary
  let content = `# Mittified Media Hub — LLM Discoverability Endpoint

Welcome to Mittified Media Hub, the premier database tracking the Pakistani YouTube ecosystem, commentaries, controversies, milestones, and creator metrics.

## Site Structure
- Home Page: ${baseUrl}
- Creator Database: ${baseUrl}/creators
- RSS Feed: ${baseUrl}/feed.xml
- Sitemap: ${baseUrl}/sitemap.xml
- Privacy Policy: ${baseUrl}/privacy
- Terms of Use: ${baseUrl}/terms

## Tracked Pakistani YouTubers (${creators.length})
`;

  creators.forEach((c) => {
    content += `- **${c.name}** (${c.handle})
  - Subscribers: ${(c.subscribers / 1000000).toFixed(2)}M
  - Monthly Views: ${(c.metrics.monthlyViews / 1000000).toFixed(1)}M
  - Status: ${c.status}
  - Drama Heat Index: ${c.dramaMeter}%
  - Bio: ${c.bio}
  - Profile URL: ${baseUrl}/creators/${c.id}
`;
  });

  content += `\n## Recent Investigations & Archives (${articles.length})\n`;

  articles.forEach((art) => {
    content += `- **${art.title}** (Category: ${art.category})
  - Date: ${new Date(art.publishedAt).toLocaleDateString()}
  - Summary: ${art.summary}
  - URL: ${baseUrl}/articles/${art.slug}
`;
  });

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
