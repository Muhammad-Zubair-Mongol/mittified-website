import { MetadataRoute } from "next";
import { getArticles, getCreators } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mittified.studio";

  // Fetch all articles & creators dynamically
  const articles = await getArticles();
  const creators = await getCreators();

  const articleEntries = articles.map((art) => ({
    url: `${baseUrl}/articles/${art.slug}`,
    lastModified: new Date(art.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const creatorEntries = creators.map((creator) => ({
    url: `${baseUrl}/creators/${creator.id}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/creators`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...articleEntries,
    ...creatorEntries,
  ];
}
