import React from "react";
import Link from "next/link";
import { getArticles, getCreators } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdsenseContainer from "@/components/AdsenseContainer";
import CreatorDatabase from "@/components/CreatorDatabase";
import { generateCreatorDirectorySchema } from "@/lib/schema";
import { Flame, ArrowRight, Eye, Calendar, Award } from "lucide-react";

export const revalidate = 900; // 15 mins page revalidation (ISR) as per Plan.md

export default async function Home() {
  const articles = await getArticles();
  const creators = await getCreators();

  // Aggregate metrics for Header
  const totalSubscribers = creators.reduce((acc, c) => acc + c.subscribers, 0);
  const exposedCount = creators.filter(c => c.status === "Drama/Exposed").length;

  const directorySchema = generateCreatorDirectorySchema(creators);

  // Split articles by category
  const mainFeatured = articles[0];
  const sideFeatured = articles.slice(1, 3);
  const restArticles = articles.slice(3);

  return (
    <>
      {/* Schema Markup for Crawlers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(directorySchema) }}
      />

      <Header totalSubscribers={totalSubscribers} exposedCount={exposedCount} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Top Header Ad Spacer to prevent shift */}
        <AdsenseContainer placement="header" adSlot="99283741" />

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Main Featured Article (Glass design) */}
          {mainFeatured && (
            <div className="lg:col-span-2 flex flex-col justify-between glass-liquid rounded-2xl overflow-hidden shadow-2xl relative group">
              <div className="relative h-96 w-full overflow-hidden">
                <img 
                  src={mainFeatured.coverImage} 
                  alt={mainFeatured.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                <span className="absolute top-4 left-4 bg-red-600 text-white font-mono font-bold text-xs uppercase px-2.5 py-1 rounded">
                  {mainFeatured.category}
                </span>
              </div>
              
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between bg-zinc-950/20">
                <div>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      {new Date(mainFeatured.publishedAt).toLocaleDateString()}
                    </span>
                    <span>By {mainFeatured.author}</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-white mb-4 group-hover:text-[#FFD700] transition-colors leading-tight">
                    {mainFeatured.title}
                  </h1>
                  <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-6">
                    {mainFeatured.summary}
                  </p>
                </div>
                <div>
                  <Link 
                    href={`/articles/${mainFeatured.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFD700] uppercase tracking-wider group/link hover:underline"
                  >
                    Read Full Investigation <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Sidebar Highlights */}
          <div className="flex flex-col gap-6">
            <div className="border-l-2 border-[#FFD700] pl-3 py-1">
              <h2 className="text-xl font-bold tracking-tight text-white uppercase font-mono">Trending Updates</h2>
            </div>
            
            {sideFeatured.map((art) => (
              <Link 
                href={`/articles/${art.slug}`}
                key={art.id}
                className="glass-liquid glass-liquid-interactive p-4 rounded-xl block group"
              >
                <span className="text-[10px] text-[#FFD700] font-mono font-bold uppercase block mb-1">
                  {art.category}
                </span>
                <h3 className="text-sm font-bold text-white group-hover:text-[#FFD700] transition-colors line-clamp-2 leading-snug mb-2">
                  {art.title}
                </h3>
                <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                  {art.summary}
                </p>
                <div className="flex items-center justify-between mt-3 text-[10px] text-zinc-500 font-mono">
                  <span>{new Date(art.publishedAt).toLocaleDateString()}</span>
                  <span className="text-zinc-400 font-semibold group-hover:underline">Read Now &rarr;</span>
                </div>
              </Link>
            ))}

            {/* In-feed Ad banner matching metrics */}
            <AdsenseContainer placement="in-feed" adSlot="88172635" />
          </div>
        </div>

        {/* Section: Creator Tracker */}
        <section className="border-t border-zinc-900 pt-12 pb-16" id="creators">
          <CreatorDatabase />
        </section>

        {/* Section: Investigation Archive */}
        {restArticles.length > 0 && (
          <section className="border-t border-zinc-900 pt-12 pb-16" id="news">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Recent Archives</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restArticles.map((art) => (
                <div key={art.id} className="glass-liquid rounded-xl overflow-hidden flex flex-col justify-between">
                  <div className="relative h-48 w-full">
                    <img src={art.coverImage} alt={art.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between bg-zinc-950/20">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-mono block mb-1 uppercase">{art.category}</span>
                      <h3 className="text-base font-bold text-white mb-2 line-clamp-2">{art.title}</h3>
                      <p className="text-zinc-400 text-xs line-clamp-3 mb-4 leading-relaxed">{art.summary}</p>
                    </div>
                    <Link 
                      href={`/articles/${art.slug}`}
                      className="text-xs font-semibold text-[#FFD700] hover:underline flex items-center gap-1"
                    >
                      Read full article &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Reusable Page Footer */}
      <Footer />
    </>
  );
}
