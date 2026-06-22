"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getArticleAnalytics, ArticleAnalyticsEvent } from "@/lib/db";
import { 
  Eye, 
  Users, 
  Clock, 
  CheckCircle, 
  Smartphone, 
  Laptop, 
  Tablet, 
  Compass, 
  Activity, 
  RefreshCw,
  Search,
  ExternalLink,
  Sparkles
} from "lucide-react";

export default function ArticleAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<ArticleAnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load analytics data
  const loadData = async () => {
    try {
      const data = await getArticleAnalytics();
      setAnalytics(data);
    } catch (e) {
      console.error("Failed to fetch article analytics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real-time auto-refresh loop (every 10s)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadData();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Aggregate global statistics
  const stats = useMemo(() => {
    if (analytics.length === 0) {
      return {
        totalViews: 0,
        uniqueVisitors: 0,
        avgDuration: 0,
        completionRate: 0,
        activeReaders: 0
      };
    }

    const totalViews = analytics.length;
    
    // Unique visitors
    const visitors = new Set(analytics.map(e => e.visitorId));
    const uniqueVisitors = visitors.size;

    // Avg duration
    const totalDuration = analytics.reduce((acc, e) => acc + e.duration, 0);
    const avgDuration = Math.round(totalDuration / totalViews);

    // Completion rate
    const completedCount = analytics.filter(e => e.isCompleted).length;
    const completionRate = Math.round((completedCount / totalViews) * 100);

    // Active readers (viewed in last 5 minutes)
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const activeReaders = analytics.filter(e => new Date(e.timestamp) >= fiveMinsAgo).length;

    return {
      totalViews,
      uniqueVisitors,
      avgDuration,
      completionRate,
      activeReaders
    };
  }, [analytics]);

  // Aggregations per article
  const articleMetrics = useMemo(() => {
    const map = new Map<string, {
      id: string;
      slug: string;
      title: string;
      category: string;
      views: number;
      visitors: Set<string>;
      totalDuration: number;
      completions: number;
      devices: { Desktop: number; Mobile: number; Tablet: number };
    }>();

    analytics.forEach(event => {
      const key = event.articleId || event.slug;
      if (!map.has(key)) {
        map.set(key, {
          id: event.articleId,
          slug: event.slug,
          title: event.title,
          category: event.category,
          views: 0,
          visitors: new Set(),
          totalDuration: 0,
          completions: 0,
          devices: { Desktop: 0, Mobile: 0, Tablet: 0 }
        });
      }

      const item = map.get(key)!;
      item.views += 1;
      item.visitors.add(event.visitorId);
      item.totalDuration += event.duration;
      if (event.isCompleted) item.completions += 1;
      
      const dev = (event.device || "Desktop") as "Desktop" | "Mobile" | "Tablet";
      if (item.devices[dev] !== undefined) {
        item.devices[dev] += 1;
      } else {
        item.devices.Desktop += 1;
      }
    });

    return Array.from(map.values()).map(item => ({
      ...item,
      uniqueVisitorsCount: item.visitors.size,
      avgDuration: Math.round(item.totalDuration / item.views),
      completionRate: Math.round((item.completions / item.views) * 100)
    }));
  }, [analytics]);

  // Device Breakdown
  const deviceBreakdown = useMemo(() => {
    const counts = { Desktop: 0, Mobile: 0, Tablet: 0 };
    analytics.forEach(e => {
      const dev = (e.device || "Desktop") as "Desktop" | "Mobile" | "Tablet";
      if (counts[dev] !== undefined) {
        counts[dev] += 1;
      } else {
        counts.Desktop += 1;
      }
    });
    const total = analytics.length || 1;
    return {
      Desktop: Math.round((counts.Desktop / total) * 100),
      Mobile: Math.round((counts.Mobile / total) * 100),
      Tablet: Math.round((counts.Tablet / total) * 100)
    };
  }, [analytics]);

  // Traffic Referrer Breakdown
  const trafficSources = useMemo(() => {
    const map = new Map<string, number>();
    analytics.forEach(e => {
      const ref = e.referrer || "Direct";
      map.set(ref, (map.get(ref) || 0) + 1);
    });

    const total = analytics.length || 1;
    return Array.from(map.entries())
      .map(([source, count]) => ({
        source,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // top 5
  }, [analytics]);

  // Filter article leaderboard based on search query
  const filteredLeaderboard = articleMetrics.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Dashboard Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
            </span>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Live Publication Metrics
            </h2>
          </div>
          <p className="text-[10px] text-zinc-500 font-mono mt-1">
            Real-time feed showing active view sessions, device shares, and article conversions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-mono text-zinc-400 cursor-pointer">
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={(e) => setAutoRefresh(e.target.checked)} 
              className="accent-[#FFD700] rounded focus:ring-0 focus:outline-none"
            />
            Auto-refresh (10s)
          </label>
          <button 
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white font-mono text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Active Readers */}
        <div className="glass-panel p-4 rounded-xl border border-zinc-800 relative overflow-hidden bg-zinc-950/40">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 blur-[25px] pointer-events-none rounded-full" />
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase">Active Readers (5m)</span>
            <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-white">{stats.activeReaders}</div>
          <div className="text-[9px] text-zinc-500 font-mono mt-1">Currently on site</div>
        </div>

        {/* Total Page Views */}
        <div className="glass-panel p-4 rounded-xl border border-zinc-800 relative overflow-hidden bg-zinc-950/40">
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFD700]/5 blur-[25px] pointer-events-none rounded-full" />
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase">Total Views</span>
            <Eye className="w-4 h-4 text-[#FFD700]" />
          </div>
          <div className="text-2xl font-black text-white">{stats.totalViews}</div>
          <div className="text-[9px] text-zinc-500 font-mono mt-1">Accumulated raw views</div>
        </div>

        {/* Unique Visitors */}
        <div className="glass-panel p-4 rounded-xl border border-zinc-800 relative overflow-hidden bg-zinc-950/40">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 blur-[25px] pointer-events-none rounded-full" />
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase">Unique Visitors</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-white">{stats.uniqueVisitors}</div>
          <div className="text-[9px] text-zinc-500 font-mono mt-1">Distinct reader IDs</div>
        </div>

        {/* Avg Read Duration */}
        <div className="glass-panel p-4 rounded-xl border border-zinc-800 relative overflow-hidden bg-zinc-950/40">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 blur-[25px] pointer-events-none rounded-full" />
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase">Avg. Read Time</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-white">
            {stats.avgDuration >= 60 
              ? `${Math.floor(stats.avgDuration / 60)}m ${stats.avgDuration % 60}s` 
              : `${stats.avgDuration}s`}
          </div>
          <div className="text-[9px] text-zinc-500 font-mono mt-1">Time spent per article</div>
        </div>

        {/* Read Completion Rate */}
        <div className="glass-panel p-4 rounded-xl border border-zinc-800 relative overflow-hidden bg-zinc-950/40 col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 blur-[25px] pointer-events-none rounded-full" />
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase">Completion Rate</span>
            <CheckCircle className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-white">{stats.completionRate}%</div>
          <div className="text-[9px] text-zinc-500 font-mono mt-1">Scrolled over 85% depth</div>
        </div>

      </div>

      {/* Row: Traffic Sources, Devices, and Real-time Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Device Breakdown */}
        <div className="glass-panel p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-1.5">
            📱 Device Share
          </h3>
          <div className="space-y-4">
            {/* Desktop */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-zinc-400 flex items-center gap-1.5"><Laptop className="w-3.5 h-3.5 text-zinc-500" /> Desktop</span>
                <span className="text-white font-bold">{deviceBreakdown.Desktop}%</span>
              </div>
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                <div className="h-full bg-[#FFD700] rounded-full" style={{ width: `${deviceBreakdown.Desktop}%` }} />
              </div>
            </div>
            
            {/* Mobile */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-zinc-400 flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-zinc-500" /> Mobile</span>
                <span className="text-white font-bold">{deviceBreakdown.Mobile}%</span>
              </div>
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${deviceBreakdown.Mobile}%` }} />
              </div>
            </div>
            
            {/* Tablet */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-zinc-400 flex items-center gap-1.5"><Tablet className="w-3.5 h-3.5 text-zinc-500" /> Tablet</span>
                <span className="text-white font-bold">{deviceBreakdown.Tablet}%</span>
              </div>
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                <div className="h-full bg-zinc-600 rounded-full" style={{ width: `${deviceBreakdown.Tablet}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Traffic Referrers */}
        <div className="glass-panel p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-emerald-500" /> Top Referrers
          </h3>
          <div className="space-y-3">
            {trafficSources.length === 0 ? (
              <p className="text-zinc-500 text-xs font-mono py-6 text-center">No traffic sources registered yet.</p>
            ) : (
              trafficSources.map((source, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-mono border-b border-zinc-900/60 pb-2 last:border-0 last:pb-0">
                  <span className="text-zinc-400 truncate max-w-[160px]">{source.source}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-500 text-[10px]">{source.count} views</span>
                    <span className="text-white font-bold min-w-[32px] text-right">{source.percentage}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Active Log */}
        <div className="glass-panel p-5 rounded-xl border border-zinc-800 bg-zinc-950/20">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-3.5 flex items-center gap-1.5">
            ⚡ Recent Activity (Top 5)
          </h3>
          <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1">
            {analytics.length === 0 ? (
              <p className="text-zinc-500 text-xs font-mono py-8 text-center">Awaiting incoming readers...</p>
            ) : (
              analytics.slice(0, 5).map((log, idx) => (
                <div key={idx} className="p-2 bg-zinc-900/40 rounded-lg border border-zinc-800/40 flex items-start justify-between gap-3 text-[10px] font-mono">
                  <div className="min-w-0 flex-1">
                    <span className="text-[#FFD700] hover:underline font-bold block truncate" title={log.title}>
                      {log.title}
                    </span>
                    <span className="text-zinc-500 text-[9px] mt-0.5 block">
                      Ref: <strong className="text-zinc-400">{log.referrer}</strong> | Session: {log.id.substring(5, 12)}...
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-zinc-300 block">{log.device}</span>
                    <span className={`font-bold block mt-0.5 ${log.isCompleted ? "text-indigo-400" : "text-zinc-500"}`}>
                      {log.duration}s {log.isCompleted ? "✓" : ""}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Article Performance Leaderboard */}
      <div className="glass-panel p-6 rounded-xl border border-zinc-800 bg-zinc-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
            📈 Article Performance Leaderboard
          </h3>
          {/* Search box for articles */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 w-3.5 h-3.5" />
            <label htmlFor="article-search-leaderboard" className="sr-only">Search article metrics</label>
            <input 
              id="article-search-leaderboard"
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter leaderboard..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-[#FFD700]/70 rounded px-2.5 py-1.5 pl-8 text-xs text-white placeholder-zinc-550 focus:outline-none"
            />
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-zinc-400">
            <thead>
              <tr className="border-b border-zinc-850 text-zinc-500 font-bold uppercase text-[10px] text-left">
                <th className="pb-3 pr-4 font-mono">Article Title</th>
                <th className="pb-3 px-3 font-mono">Category</th>
                <th className="pb-3 px-3 text-right font-mono">Views</th>
                <th className="pb-3 px-3 text-right font-mono">Unique Readers</th>
                <th className="pb-3 px-3 text-right font-mono">Avg Time</th>
                <th className="pb-3 px-3 text-right font-mono">Completions</th>
                <th className="pb-3 pl-3 text-center font-mono">Device Breakdown (D/M/T)</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaderboard.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-550">
                    No articles found matching search query.
                  </td>
                </tr>
              ) : (
                filteredLeaderboard.map((item, idx) => {
                  const total = item.views || 1;
                  const desktopP = Math.round((item.devices.Desktop / total) * 100);
                  const mobileP = Math.round((item.devices.Mobile / total) * 100);
                  const tabletP = Math.round((item.devices.Tablet / total) * 100);

                  return (
                    <tr key={idx} className="border-b border-zinc-900/70 hover:bg-zinc-900/20 transition-colors">
                      <td className="py-3.5 pr-4 max-w-xs sm:max-w-sm truncate">
                        <Link 
                          href={`/articles/${item.slug}`} 
                          target="_blank"
                          className="font-bold text-zinc-200 hover:text-[#FFD700] hover:underline flex items-center gap-1.5"
                        >
                          {item.title} <ExternalLink className="w-3 h-3 text-zinc-550 flex-shrink-0" />
                        </Link>
                        <span className="text-[9px] text-zinc-550 block mt-0.5">/{item.slug}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-[#FFD700]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-bold text-white">{item.views}</td>
                      <td className="py-3.5 px-3 text-right font-bold text-zinc-300">{item.uniqueVisitorsCount}</td>
                      <td className="py-3.5 px-3 text-right text-emerald-400 font-bold">
                        {item.avgDuration}s
                      </td>
                      <td className="py-3.5 px-3 text-right text-indigo-400 font-bold">
                        {item.completionRate}%
                      </td>
                      <td className="py-3.5 pl-3">
                        <div className="flex items-center justify-center gap-2 text-[9px] text-zinc-500">
                          <span title={`Desktop: ${desktopP}%`}>💻 {desktopP}%</span>
                          <span>/</span>
                          <span title={`Mobile: ${mobileP}%`}>📱 {mobileP}%</span>
                          <span>/</span>
                          <span title={`Tablet: ${tabletP}%`}>📟 {tabletP}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic tips section */}
        {articleMetrics.length > 0 && (
          <div className="mt-6 p-4 rounded-xl border border-[#FFD700]/10 bg-[#FFD700]/5 flex gap-3 text-xs leading-relaxed text-zinc-350">
            <div className="flex-shrink-0 p-1 rounded bg-[#FFD700]/10 text-[#FFD700] self-start">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <strong className="text-white block uppercase tracking-wide text-[10px] font-mono mb-1">Content Strategy Optimization Tip:</strong>
              {(() => {
                // Find article with lowest completion rate but high views
                const candidates = articleMetrics.filter(m => m.views >= 3);
                if (candidates.length === 0) {
                  return "Continue monitoring traffic. Over time, Mittified will flag drop-off rates so you can tweak intros to keep readers hooked!";
                }
                const lowestComp = [...candidates].sort((a, b) => a.completionRate - b.completionRate)[0];
                const highestDur = [...candidates].sort((a, b) => b.avgDuration - a.avgDuration)[0];
                
                if (lowestComp && lowestComp.completionRate < 60) {
                  return `Readers are dropping off early on "${lowestComp.title}" (Completion: ${lowestComp.completionRate}%). Consider rewriting the intro or adding an engaging AdSense layout wrapper closer to the header to monetize the early bounce.`;
                } else if (highestDur) {
                  return `Outstanding engagement on "${highestDur.title}" with an average read time of ${highestDur.avgDuration}s. Consider writing a follow-up piece or embedding high-CPM custom sponsorship ads in its sidebar.`;
                }
                return "Your articles are showing stable engagement levels. To optimize conversions, tweak your custom UTM targets in social posts to increase mobile referral shares.";
              })()}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
