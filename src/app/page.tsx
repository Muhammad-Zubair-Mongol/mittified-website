import React from "react";
import type { Metadata } from "next";
import { BASE_URL } from "@/lib/config";
import { getArticles, getCreators, getArticleCategories } from "@/lib/db";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdsenseContainer from "@/components/AdsenseContainer";
import CreatorDatabase from "@/components/CreatorDatabase";
import ArticleFeed from "@/components/ArticleFeed";
import AlertSubscription from "@/components/AlertSubscription";
import { generateCreatorDirectorySchema } from "@/lib/schema";
import { Sparkles } from "lucide-react";

const title = "Mittified Media - Pakistani YouTube Tracker, Database & News";
const description = "Track live stats, monthly viewership trends, and audience engagement benchmarks for Pakistan's top influencers and YouTube drama archives.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title,
    description,
    url: BASE_URL,
    siteName: "Mittified Media",
    images: [
      {
        url: `${BASE_URL}/logo.png`,
        width: 144,
        height: 144,
        alt: "Mittified Media Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${BASE_URL}/logo.png`],
  },
};

export const revalidate = 900; // 15 mins page revalidation (ISR) as per Plan.md

export default async function Home() {
  const articles = await getArticles();
  const creators = await getCreators();
  const categories = await getArticleCategories();

  // Aggregate metrics for Header
  const totalSubscribers = creators.reduce((acc, c) => acc + c.subscribers, 0);
  const exposedCount = creators.filter(c => c.status === "Drama/Exposed").length;

  const directorySchema = generateCreatorDirectorySchema(creators);

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

        {/* Dynamic Interactive Article Feed (Pretzel - free engaging content) */}
        <div className="mb-16">
          <ArticleFeed initialArticles={articles} categories={categories} />
        </div>

        {/* Premium Upgrade Hook & Creator Database Section (Water - selling the value/analytics) */}
        <section className="border-t border-zinc-900 pt-16 pb-16 scroll-reveal" id="creators">
          <div className="glass-panel p-6 rounded-2xl border border-[#FFD700]/20 bg-zinc-950/40 mb-10 relative overflow-hidden group">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/5 blur-[80px] pointer-events-none rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-amber-500/5 blur-[60px] pointer-events-none rounded-full" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] text-[10px] font-mono font-bold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> PRO INTELLIGENCE UPGRADE
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-2">
                  Creator Analytics & Market Intelligence Suite
                </h3>
                <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
                  Track dynamic heat indexes, real-time subscriber changes, monthly viewership trends, and audience engagement benchmarks for Pakistan&apos;s top influencers. Elevate your media strategy.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-center shrink-0">
                <button className="px-5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer">
                  Request API Access
                </button>
                <AlertSubscription />
              </div>
            </div>
          </div>

          <CreatorDatabase />
        </section>
      </main>

      {/* Reusable Page Footer */}
      <Footer />
    </>
  );
}
