import { NextResponse } from "next/server";
import { getArticles } from "@/lib/db";
import { BASE_URL } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const articles = await getArticles(30);
  const baseUrl = BASE_URL;

  const itemsXml = articles
    .map((art) => {
      const cleanContent = (art.content || "").replace(/\]\]>/g, "]]&gt;");
      return `
    <item>
      <title>${escapeXml(art.title)}</title>
      <link>${baseUrl}/articles/${art.slug}</link>
      <guid>${baseUrl}/articles/${art.slug}</guid>
      <pubDate>${new Date(art.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(art.summary)}</description>
      <content:encoded><![CDATA[${cleanContent}]]></content:encoded>
    </item>`;
    })
    .join("");

  const rssFeedXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Mittified Media Hub</title>
  <link>${baseUrl}</link>
  <description>The premier independent news source tracking the Pakistani YouTube ecosystem.</description>
  <language>en-us</language>
  <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
  ${itemsXml}
</channel>
</rss>`;

  return new NextResponse(rssFeedXml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}
