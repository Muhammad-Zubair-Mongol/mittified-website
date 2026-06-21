import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticles, getCreators, getArticleBySlug, getCreatorById } from "@/lib/db";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdsenseContainer from "@/components/AdsenseContainer";
import { generateArticleSchema, generateVideoSchema } from "@/lib/schema";
import { Calendar, User, ArrowLeft } from "lucide-react";

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.52 3.545 12 3.545 12 3.545s-7.52 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.868.507 9.388.507 9.388.507s7.52 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 900;

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const creator = article.creatorId ? await getCreatorById(article.creatorId) : null;
  const creators = await getCreators();

  const totalSubscribers = creators.reduce((acc, c) => acc + c.subscribers, 0);
  const exposedCount = creators.filter(c => c.status === "Drama/Exposed").length;

  const articleSchema = generateArticleSchema(article);
  const videoSchema = generateVideoSchema(article);

  return (
    <>
      {/* Schema Tags */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {videoSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
        />
      )}

      <Header totalSubscribers={totalSubscribers} exposedCount={exposedCount} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white mb-6 uppercase"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Headlines
        </Link>

        <article>
          {/* Header Metadata */}
          <div className="mb-6">
            <span className="bg-[#FFD700] text-black font-mono font-bold text-xs uppercase px-2 py-0.5 rounded">
              {article.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white mt-4 mb-6 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-500 font-mono border-y border-zinc-900 py-3.5">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> {article.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(article.publishedAt).toLocaleDateString()}
              </span>
              {creator && (
                <span className="flex items-center gap-1">
                  Covered Creator: <Link href={`/creators/${creator.id}`} className="text-[#FFD700] hover:underline font-bold">{creator.name}</Link>
                </span>
              )}
            </div>
          </div>

          {/* Banner Image */}
          <div className="relative h-96 w-full rounded-2xl overflow-hidden border border-zinc-800 mb-8">
            <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
          </div>

          <AdsenseContainer placement="header" adSlot="33994400" />

          {/* Article Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
            <div className="lg:col-span-3">
              {/* Rich Body Content */}
              <div 
                className="prose prose-invert max-w-none text-zinc-300 leading-relaxed text-base space-y-6"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* YouTube Embedded Media section */}
              {article.youtubeVideoId && (
                <div className="mt-8 pt-8 border-t border-zinc-900">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <YoutubeIcon className="w-5 h-5 text-red-500" /> Media Attachment
                  </h3>
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-zinc-800">
                    <iframe
                      src={`https://www.youtube.com/embed/${article.youtubeVideoId}`}
                      title="YouTube media player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono mt-2 text-right">
                    Video ID: {article.youtubeVideoId}
                  </p>
                </div>
              )}

              {/* Tags Section */}
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-zinc-900">
                {article.tags.map((tag) => (
                  <span 
                    key={tag} 
                    className="text-xs text-zinc-400 bg-zinc-900 border border-zinc-850 px-2.5 py-1 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Sidebar Ad Placement */}
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono block mb-4">Ad Placement</span>
                <AdsenseContainer placement="in-feed" adSlot="44991100" />
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
