import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCreators, getArticles, getCreatorById, getArticlesByCreatorId } from "@/lib/db";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdsenseContainer from "@/components/AdsenseContainer";
import { Flame, ArrowLeft } from "lucide-react";

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.52 3.545 12 3.545 12 3.545s-7.52 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.868.507 9.388.507 9.388.507s7.52 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 900;

export async function generateStaticParams() {
  const creators = await getCreators();
  return creators.map((creator) => ({
    id: creator.id,
  }));
}

export default async function CreatorDetailPage({ params }: PageProps) {
  const { id } = await params;
  const creator = await getCreatorById(id);

  if (!creator) {
    notFound();
  }

  const relatedArticles = await getArticlesByCreatorId(creator.id);
  const creators = await getCreators();

  const totalSubscribers = creators.reduce((acc, c) => acc + c.subscribers, 0);
  const exposedCount = creators.filter(c => c.status === "Drama/Exposed").length;

  const isDrama = creator.status === "Drama/Exposed" || creator.dramaMeter > 70;

  return (
    <>
      <Header totalSubscribers={totalSubscribers} exposedCount={exposedCount} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/creators"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white mb-6 uppercase"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Database
        </Link>

        {/* Creator Info Glass Panel */}
        <div className="glass-panel p-6 md:p-8 rounded-2xl border border-zinc-800 shadow-2xl relative overflow-hidden mb-8">
          {isDrama && (
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[80px] pointer-events-none rounded-full" />
          )}

          <div className="flex flex-col md:flex-row gap-6 items-start">
            <img 
              src={creator.avatarUrl} 
              alt={creator.name} 
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-zinc-700 object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-extrabold text-white">{creator.name}</h1>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  creator.status === "Active" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                  creator.status === "Hiatus" ? "bg-zinc-800 text-zinc-400 border border-zinc-700" :
                  creator.status === "Drama/Exposed" ? "bg-red-500/15 text-red-400 border border-red-500/20 animate-pulse" :
                  "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                }`}>
                  {creator.status}
                </span>
                <span className="text-xs text-zinc-400 bg-zinc-900 px-2.5 py-0.5 rounded border border-zinc-850">
                  {creator.category}
                </span>
              </div>
              <p className="text-zinc-500 text-sm font-mono mt-1">{creator.handle}</p>
              <p className="text-zinc-300 text-sm mt-4 leading-relaxed max-w-2xl">{creator.bio}</p>

              {/* Social Channels list */}
              <div className="flex items-center gap-3 mt-6">
                <a 
                  href={creator.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <YoutubeIcon className="w-4 h-4 text-red-500" /> Channel Link
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Subscribers Stats Card */}
          <div className="glass-panel p-6 rounded-xl border border-zinc-800/80">
            <span className="text-zinc-500 text-[10px] font-mono block mb-1">TOTAL REACH</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{(creator.subscribers / 1000000).toFixed(2)}M</span>
              <span className="text-zinc-500 text-xs font-mono">Subscribers</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 font-mono">Channel ID: {creator.channelId}</p>
          </div>

          {/* Monthly Viewership Card */}
          <div className="glass-panel p-6 rounded-xl border border-zinc-800/80">
            <span className="text-zinc-500 text-[10px] font-mono block mb-1">MONTHLY TRAFFIC</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{(creator.metrics.monthlyViews / 1000000).toFixed(1)}M</span>
              <span className="text-zinc-500 text-xs font-mono">Views</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 font-mono">Engagement Rate: {creator.metrics.engagementRate}%</p>
          </div>

          {/* Drama Meter Card */}
          <div className="glass-panel p-6 rounded-xl border border-zinc-800/80">
            <span className="text-zinc-500 text-[10px] font-mono block mb-1 uppercase">Drama index heat</span>
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className={`text-3xl font-extrabold ${isDrama ? "text-red-400" : "text-white"}`}>
                {creator.dramaMeter}%
              </span>
              <Flame className={`w-8 h-8 ${isDrama ? "text-red-500 animate-pulse" : "text-zinc-500"}`} />
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
              <div 
                className={`h-full rounded-full ${
                  creator.dramaMeter > 70 ? "bg-red-500" :
                  creator.dramaMeter > 40 ? "bg-amber-500" : "bg-zinc-600"
                }`}
                style={{ width: `${creator.dramaMeter}%` }}
              />
            </div>
            {creator.recentDramaTitle && (
              <p className="text-[10px] text-amber-500 mt-2 line-clamp-1 italic">
                ⚠️ {creator.recentDramaTitle}
              </p>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Related Articles list */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-tight font-mono border-l-2 border-[#FFD700] pl-3">
              Associated News & Coverage
            </h2>
            
            {relatedArticles.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-zinc-850 rounded-xl bg-zinc-900/10">
                <p className="text-zinc-500 text-sm">No coverage records matching {creator.name} currently archived.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {relatedArticles.map((art) => (
                  <div key={art.id} className="glass-panel p-5 rounded-xl border border-zinc-800 flex flex-col md:flex-row gap-4 items-start">
                    <img 
                      src={art.coverImage} 
                      alt={art.title} 
                      className="w-full md:w-40 h-28 object-cover rounded-lg border border-zinc-800"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-[#FFD700] font-mono font-bold uppercase">{art.category}</span>
                      <h3 className="text-base font-bold text-white mt-1 mb-2 hover:text-[#FFD700] transition-colors">
                        <Link href={`/articles/${art.slug}`}>{art.title}</Link>
                      </h3>
                      <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed mb-3">{art.summary}</p>
                      <Link 
                        href={`/articles/${art.slug}`}
                        className="text-xs text-zinc-400 hover:text-white font-mono"
                      >
                        Read Investigation &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ad banner spot */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-tight font-mono border-l-2 border-zinc-800 pl-3">
              Advertising
            </h2>
            <AdsenseContainer placement="in-feed" adSlot="44992288" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
