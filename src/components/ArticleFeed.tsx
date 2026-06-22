"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/lib/mockData";
import AdsenseContainer from "@/components/AdsenseContainer";
import { ArrowRight, Calendar, Bookmark, Search } from "lucide-react";
import { formatDate } from "@/lib/db";

interface ArticleFeedProps {
  initialArticles: Article[];
  categories: string[];
}

export default function ArticleFeed({ initialArticles, categories }: ArticleFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = initialArticles.filter(art => {
    const matchesCategory = selectedCategory === "All" || art.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = searchQuery.trim() === "" ||
                          art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Layout structures when viewing "All" with no search
  const isDefaultView = selectedCategory === "All" && searchQuery.trim() === "";
  const mainFeatured = filteredArticles[0];
  const sideFeatured = filteredArticles.slice(1, 3);
  const restArticles = filteredArticles.slice(3);

  const allCategories = ["All", ...categories];

  return (
    <div className="w-full">
      {/* Dynamic Category Filtering Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900 pb-5 mb-6 gap-4">
        <div>
          <span className="text-[10px] text-[#FFD700] font-mono font-bold uppercase tracking-wider block mb-1">
            Mitti Fied Headlines
          </span>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">
            The Newsroom
          </h2>
        </div>

        {/* Category Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-thin scrollbar-thumb-zinc-800">
          {allCategories.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border transition-all duration-350 cursor-pointer ${
                  isActive
                    ? "bg-[#FFD700] text-black border-[#FFD700] shadow-md shadow-[#FFD700]/10"
                    : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative w-full mb-8 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
        <label htmlFor="article-search" className="sr-only">Search article database</label>
        <input
          id="article-search"
          type="text"
          placeholder="Search articles by title, summary, or tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-850 focus:border-[#FFD700]/70 focus:ring-1 focus:ring-[#FFD700]/70 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-550 outline-none transition-all duration-200"
        />
      </div>

      {filteredArticles.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-900 rounded-2xl bg-zinc-950/20">
          <Bookmark className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-sm">No investigations found matching your filters.</p>
        </div>
      ) : isDefaultView ? (
        /* Classic Featured Layout for Home View */
        <div className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Featured Article */}
            {mainFeatured && (
              <div className="lg:col-span-2 flex flex-col justify-between glass-liquid rounded-2xl overflow-hidden shadow-2xl relative group border border-zinc-900">
                <div className="relative h-96 w-full overflow-hidden bg-zinc-950 flex items-center justify-center">
                  <div 
                    className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-30 scale-105"
                    style={{ backgroundImage: `url(${mainFeatured.coverImage})` }}
                  />
                  <div className="relative z-10 w-full h-full">
                    <Image 
                      src={mainFeatured.coverImage} 
                      alt={mainFeatured.title} 
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-contain group-hover:scale-102 transition-transform duration-700 ease-out"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-20" />
                  <span className="absolute top-4 left-4 bg-red-600 text-white font-mono font-bold text-xs uppercase px-2.5 py-1 rounded z-25">
                    {mainFeatured.category}
                  </span>
                </div>
                
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-between bg-zinc-950/20">
                  <div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500 font-mono mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                        {formatDate(mainFeatured.publishedAt)}
                      </span>
                      <span>By {mainFeatured.author}</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-4 group-hover:text-[#FFD700] transition-colors leading-tight">
                      {mainFeatured.title}
                    </h3>
                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-6">
                      {mainFeatured.summary}
                    </p>
                  </div>
                  <div>
                    <Link 
                      href={`/articles/${mainFeatured.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFD700] uppercase tracking-wider group/link hover:underline transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
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
                <h4 className="text-sm font-bold tracking-tight text-white uppercase font-mono">Trending Updates</h4>
              </div>
              
              {sideFeatured.map((art) => (
                <Link 
                  href={`/articles/${art.slug}`}
                  key={art.id}
                  className="glass-liquid glass-liquid-interactive p-4 rounded-xl block group transition-all duration-200 hover:-translate-y-1 active:scale-[0.98] hover:shadow-lg scroll-reveal border border-zinc-900"
                >
                  <span className="text-[10px] text-[#FFD700] font-mono font-bold uppercase block mb-1">
                    {art.category}
                  </span>
                  <h5 className="text-sm font-bold text-white group-hover:text-[#FFD700] transition-colors line-clamp-2 leading-snug mb-2">
                    {art.title}
                  </h5>
                  <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>
                  <div className="flex items-center justify-between mt-3 text-[10px] text-zinc-500 font-mono">
                    <span>{formatDate(art.publishedAt)}</span>
                    <span className="text-zinc-400 font-semibold group-hover:underline">Read Now &rarr;</span>
                  </div>
                </Link>
              ))}

              <AdsenseContainer placement="in-feed" adSlot="88172635" />
            </div>
          </div>

          {/* Investigation Archive Grid */}
          {restArticles.length > 0 && (
            <div className="border-t border-zinc-900 pt-10">
              <h4 className="text-lg font-black text-white uppercase tracking-tight mb-6">Recent Archives</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restArticles.map((art) => (
                  <div key={art.id} className="glass-liquid rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group border border-zinc-900">
                    <div className="relative h-48 w-full bg-zinc-950 overflow-hidden flex items-center justify-center">
                      <div 
                        className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-30 scale-105"
                        style={{ backgroundImage: `url(${art.coverImage})` }}
                      />
                      <div className="relative z-10 w-full h-full">
                        <Image 
                          src={art.coverImage} 
                          alt={art.title} 
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain" 
                        />
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between bg-zinc-950/20">
                      <div>
                        <span className="text-[10px] text-zinc-500 font-mono block mb-1 uppercase">{art.category}</span>
                        <h5 className="text-base font-bold text-white mb-2 line-clamp-2">{art.title}</h5>
                        <p className="text-zinc-400 text-xs line-clamp-3 mb-4 leading-relaxed">{art.summary}</p>
                      </div>
                      <Link 
                        href={`/articles/${art.slug}`}
                        className="text-xs font-semibold text-[#FFD700] hover:underline flex items-center gap-1 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                      >
                        Read full article &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Uniform Grid view for filtered categories */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => (
            <div key={art.id} className="glass-liquid rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group border border-zinc-900">
              <div className="relative h-48 w-full bg-zinc-950 overflow-hidden flex items-center justify-center">
                <div 
                  className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-30 scale-105"
                  style={{ backgroundImage: `url(${art.coverImage})` }}
                />
                <div className="relative z-10 w-full h-full">
                  <Image 
                    src={art.coverImage} 
                    alt={art.title} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain" 
                  />
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between bg-zinc-950/20">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] text-zinc-550 font-mono uppercase">{art.category}</span>
                    <span className="text-[9px] text-zinc-500 font-mono">{formatDate(art.publishedAt)}</span>
                  </div>
                  <h5 className="text-base font-bold text-white mb-2 line-clamp-2 group-hover:text-[#FFD700] transition-colors">{art.title}</h5>
                  <p className="text-zinc-400 text-xs line-clamp-3 mb-4 leading-relaxed">{art.summary}</p>
                </div>
                <Link 
                  href={`/articles/${art.slug}`}
                  className="text-xs font-semibold text-[#FFD700] hover:underline flex items-center gap-1 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                >
                  Read full article &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
