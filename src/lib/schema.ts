import { Creator, Article } from "./mockData";

export function generateArticleSchema(article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.summary,
    "image": [article.coverImage],
    "datePublished": article.publishedAt,
    "dateModified": article.publishedAt,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Mittified Media",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mittified.media/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://mittified.media/articles/${article.slug}`
    }
  };
}

export function generateVideoSchema(article: Article) {
  if (!article.youtubeVideoId) return null;
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": article.title,
    "description": article.summary,
    "thumbnailUrl": [
      `https://img.youtube.com/vi/${article.youtubeVideoId}/maxresdefault.jpg`,
      `https://img.youtube.com/vi/${article.youtubeVideoId}/0.jpg`
    ],
    "uploadDate": article.publishedAt,
    "contentUrl": `https://www.youtube.com/watch?v=${article.youtubeVideoId}`,
    "embedUrl": `https://www.youtube.com/embed/${article.youtubeVideoId}`
  };
}

export function generateCreatorDirectorySchema(creators: Creator[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": creators.map((creator, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Person",
        "name": creator.name,
        "jobTitle": "Content Creator",
        "url": `https://mittified.media/creators/${creator.id}`,
        "sameAs": [
          creator.socials.youtube,
          creator.socials.instagram,
          creator.socials.twitter
        ].filter(Boolean)
      }
    }))
  };
}
