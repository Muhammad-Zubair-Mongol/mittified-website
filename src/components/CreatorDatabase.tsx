"use client";

import React, { useState, useEffect } from "react";
import { Creator } from "@/lib/mockData";
import { getCreators, getCreatorCategories } from "@/lib/db";
import { Search, Flame, Filter, SlidersHorizontal, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function CreatorDatabase() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [categories, setCategories] = useState<string[]>(["All", "Vlogger", "Gamer", "Tech", "Infotainment", "Drama/Rant", "Comedy"]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState<"subs" | "drama" | "views">("subs");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getCreators();
      setCreators(data);
      
      const dynamicCats = await getCreatorCategories();
      setCategories(["All", ...dynamicCats]);
      
      setLoading(false);
    }
    load();
  }, []);
  const statuses = ["All", "Active", "Hiatus", "Drama/Exposed", "Under Investigation"];

  const filteredCreators = creators
    .filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                            c.handle.toLowerCase().includes(search.toLowerCase());
      const matchesCat = categoryFilter === "All" || c.category === categoryFilter;
      const matchesStatus = statusFilter === "All" || c.status === statusFilter;
      return matchesSearch && matchesCat && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "subs") return b.subscribers - a.subscribers;
      if (sortBy === "drama") return b.dramaMeter - a.dramaMeter;
      if (sortBy === "views") return b.metrics.monthlyViews - a.metrics.monthlyViews;
      return 0;
    });

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Creator Database
          </h2>
          <p className="text-zinc-400 text-sm">
            Monitor and research performance metrics, drama meters, and status updates for major Pakistani creators.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-[#FFD700] bg-zinc-900 border border-zinc-800 rounded-md px-3 py-1.5 self-start">
          <TrendingUp className="w-4 h-4 text-[#FFD700]" />
          <span>Active Tracker Pool: {creators.length} Creators</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-panel p-4 rounded-xl border border-zinc-800 shadow-xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <label htmlFor="creator-search" className="sr-only">Search creator or handle</label>
            <input
              id="creator-search"
              type="text"
              placeholder="Search creator or handle..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#FFD700]/70 focus:ring-1 focus:ring-[#FFD700]/70 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-zinc-500 w-4 h-4 shrink-0" />
            <label htmlFor="creator-category" className="sr-only">Filter by category</label>
            <select
              id="creator-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-300 outline-none focus:border-[#FFD700]"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat} (Category)</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="text-zinc-500 w-4 h-4 shrink-0" />
            <label htmlFor="creator-status" className="sr-only">Filter by status</label>
            <select
              id="creator-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-300 outline-none focus:border-[#FFD700]"
            >
              {statuses.map(st => (
                <option key={st} value={st}>{st} (Status)</option>
              ))}
            </select>
          </div>

          {/* Sort selection */}
          <div className="flex items-center gap-2">
            <label htmlFor="creator-sort" className="text-xs text-zinc-500 font-mono shrink-0">Sort By</label>
            <select
              id="creator-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "subs" | "drama" | "views")}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-300 outline-none focus:border-[#FFD700]"
            >
              <option value="subs">Subscribers Count</option>
              <option value="drama">Drama Heat Index</option>
              <option value="views">Monthly Viewership</option>
            </select>
          </div>
        </div>
      </div>

      {/* Creators Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500 text-sm">Synchronizing live creator database...</p>
        </div>
      ) : filteredCreators.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl">
          <p className="text-zinc-500">No creators found matching active criteria filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((creator) => {
            const isDrama = creator.status === "Drama/Exposed" || creator.dramaMeter > 70;
            return (
              <div 
                key={creator.id}
                className="glass-panel p-5 rounded-xl border border-zinc-800 hover-scale relative overflow-hidden group flex flex-col justify-between"
              >
                {/* Visual drama indicator gradient backdrop */}
                {isDrama && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[40px] pointer-events-none rounded-full" />
                )}

                <div>
                  {/* Top line: Avatar & Status */}
                  <div className="flex items-start gap-4 mb-4">
                    <img 
                      src={creator.avatarUrl} 
                      alt={creator.name} 
                      className="w-14 h-14 rounded-full border border-zinc-700 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white truncate group-hover:text-[#FFD700] transition-colors">
                        {creator.name}
                      </h3>
                      <p className="text-xs text-zinc-500 font-mono truncate">{creator.handle}</p>
                      
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          creator.status === "Active" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                          creator.status === "Hiatus" ? "bg-zinc-800 text-zinc-400 border border-zinc-700" :
                          creator.status === "Drama/Exposed" ? "bg-red-500/15 text-red-400 border border-red-500/20 animate-pulse" :
                          "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                        }`}>
                          {creator.status}
                        </span>
                        <span className="text-[10px] text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                          {creator.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-zinc-400 text-xs line-clamp-2 mb-4 leading-relaxed">
                    {creator.bio}
                  </p>

                  {/* Subscribers & views metrics */}
                  <div className="grid grid-cols-2 gap-2 bg-zinc-900/60 border border-zinc-800/60 p-2.5 rounded-lg mb-4 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-zinc-500 block">SUBSCRIBERS</span>
                      <span className="text-white font-bold">{(creator.subscribers / 1000000).toFixed(2)}M</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block">MONTHLY VIEWS</span>
                      <span className="text-white font-bold">{(creator.metrics.monthlyViews / 1000000).toFixed(1)}M</span>
                    </div>
                  </div>
                </div>

                {/* Drama Meter gauge */}
                <div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-zinc-500 flex items-center gap-1 font-mono">
                        <Flame className={`w-3.5 h-3.5 ${isDrama ? "text-red-500" : "text-amber-500"}`} /> DRAMA INDEX
                      </span>
                      <span className={`font-bold ${isDrama ? "text-red-400" : "text-zinc-300"}`}>
                        {creator.dramaMeter}%
                      </span>
                    </div>
                    <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          creator.dramaMeter > 70 ? "bg-red-500" :
                          creator.dramaMeter > 40 ? "bg-amber-500" : "bg-zinc-600"
                        }`}
                        style={{ width: `${creator.dramaMeter}%` }}
                      />
                    </div>
                    {creator.recentDramaTitle && (
                      <p className="text-[10px] text-amber-500/90 italic mt-1.5 line-clamp-1">
                        ⚠️ {creator.recentDramaTitle}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 border-t border-zinc-800/80 pt-3">
                    <Link
                      href={`/creators/${creator.id}`}
                      className="flex-1 text-center text-xs font-semibold py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                    >
                      View Analytics
                    </Link>
                    <a
                      href={creator.socials.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-red-500/40 text-zinc-400 hover:text-red-500 transition-colors"
                      title="YouTube Channel"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.52 3.545 12 3.545 12 3.545s-7.52 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.868.507 9.388.507 9.388.507s7.52 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
