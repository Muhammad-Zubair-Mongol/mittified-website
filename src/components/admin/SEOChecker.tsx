"use client";

import React, { useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Link2,
  Shield,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────
interface SEOCheckerProps {
  title: string;
  slug: string;
  summary: string;
  content: string;
  tags: string;
  onContentFix?: (fixedContent: string) => void;
  onSummaryFix?: (fixedSummary: string) => void;
  creators?: Array<{ id: string; name: string; handle: string }>;
}

type CheckStatus = "pass" | "fail" | "warn";

interface CheckResult {
  label: string;
  status: CheckStatus;
  detail: string;
  points: number;
  maxPoints: number;
}

// ── AI Cliché Replacements ────────────────────────────────────────────
const AI_CLICHE_MAP: [RegExp, string][] = [
  [/\bit's important to note\b/gi, ""],
  [/\bin today's digital age\b/gi, "now"],
  [/\bat the end of the day\b/gi, "ultimately"],
  [/\bneedless to say\b/gi, ""],
  [/\bit goes without saying\b/gi, ""],
  [/\bin conclusion\b/gi, ""],
  [/\bgame-changer\b/gi, "major shift"],
  [/\bdeep dive\b/gi, "close look"],
  [/\bfurthermore\b/gi, "also"],
  [/\bmoreover\b/gi, "and"],
  [/\bdelve\b/gi, "examine"],
  [/\btapestry\b/gi, "mix"],
  [/\btestament\b/gi, "proof"],
  [/\blandscape\b/gi, "scene"],
  [/\bparadigm\b/gi, "model"],
  [/\bleverage\b/gi, "use"],
  [/\bsynergy\b/gi, "teamwork"],
  [/\bunpack\b/gi, "break down"],
];

// Plain-text patterns for detection (case insensitive)
const AI_CLICHE_DETECT: string[] = [
  "delve",
  "tapestry",
  "testament",
  "landscape",
  "furthermore",
  "moreover",
  "it's important to note",
  "in today's digital age",
  "in conclusion",
  "game-changer",
  "paradigm",
  "leverage",
  "synergy",
  "deep dive",
  "unpack",
  "at the end of the day",
  "needless to say",
  "it goes without saying",
];

// ── Helpers ───────────────────────────────────────────────────────────
function countWords(text: string): number {
  const stripped = text.replace(/<[^>]*>/g, " ").replace(/&[^;]+;/g, " ");
  return stripped
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

function findCliches(text: string): string[] {
  const lower = text.toLowerCase();
  return AI_CLICHE_DETECT.filter((phrase) => lower.includes(phrase));
}

function cleanCliches(text: string): string {
  let result = text;
  for (const [pattern, replacement] of AI_CLICHE_MAP) {
    result = result.replace(pattern, replacement);
  }
  // Clean up double spaces / orphaned commas from empty replacements
  result = result.replace(/\s{2,}/g, " ").replace(/\s,/g, ",").replace(/,\s*\./g, ".").trim();
  return result;
}

// ── Component ─────────────────────────────────────────────────────────
export default function SEOChecker({
  title,
  slug,
  summary,
  content,
  tags,
  onContentFix,
  onSummaryFix,
  creators,
}: SEOCheckerProps) {
  const [expanded, setExpanded] = useState(true);

  // ── Run all checks ──────────────────────────────────────────────────
  const checks = useMemo<CheckResult[]>(() => {
    const results: CheckResult[] = [];
    const titleLen = title.trim().length;
    const slugVal = slug.trim();
    const summaryLen = summary.trim().length;
    const wordCount = countWords(content);
    const tagsArr = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const clichesFound = findCliches(content + " " + summary);
    const contentLower = content.toLowerCase();

    // 1. Title Length
    if (titleLen >= 50 && titleLen <= 60) {
      results.push({ label: "Title Length", status: "pass", detail: `${titleLen} chars (ideal: 50-60)`, points: 10, maxPoints: 10 });
    } else if (titleLen < 30 || titleLen > 70) {
      results.push({ label: "Title Length", status: "fail", detail: `${titleLen} chars (ideal: 50-60)`, points: 0, maxPoints: 10 });
    } else {
      results.push({ label: "Title Length", status: "warn", detail: `${titleLen} chars (ideal: 50-60)`, points: 5, maxPoints: 10 });
    }

    // 2. Slug
    const slugSafe = /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slugVal);
    if (slugVal && slugSafe) {
      results.push({ label: "Slug URL-Safe", status: "pass", detail: "Clean, lowercase, hyphenated", points: 10, maxPoints: 10 });
    } else if (!slugVal) {
      results.push({ label: "Slug URL-Safe", status: "fail", detail: "Slug is empty", points: 0, maxPoints: 10 });
    } else {
      results.push({ label: "Slug URL-Safe", status: "fail", detail: "Contains spaces, uppercase, or special chars", points: 0, maxPoints: 10 });
    }

    // 3. Meta Summary
    if (summaryLen >= 120 && summaryLen <= 160) {
      results.push({ label: "Meta Summary", status: "pass", detail: `${summaryLen} chars (ideal: 120-160)`, points: 10, maxPoints: 10 });
    } else if (!summaryLen) {
      results.push({ label: "Meta Summary", status: "fail", detail: "Missing", points: 0, maxPoints: 10 });
    } else if (summaryLen < 50 || summaryLen > 170) {
      results.push({ label: "Meta Summary", status: "fail", detail: `${summaryLen} chars (ideal: 120-160)`, points: 2, maxPoints: 10 });
    } else {
      results.push({ label: "Meta Summary", status: "warn", detail: `${summaryLen} chars (ideal: 120-160)`, points: 6, maxPoints: 10 });
    }

    // 4. Word Count
    if (wordCount >= 300) {
      results.push({ label: "Word Count", status: "pass", detail: `${wordCount} words (min 300)`, points: 15, maxPoints: 15 });
    } else if (wordCount >= 150) {
      results.push({ label: "Word Count", status: "warn", detail: `${wordCount} words (min 300)`, points: 8, maxPoints: 15 });
    } else {
      results.push({ label: "Word Count", status: "fail", detail: `${wordCount} words (min 300)`, points: 0, maxPoints: 15 });
    }

    // 5. H2/H3 Headings
    const hasHeadings = /<h[23][^>]*>/i.test(content);
    results.push({
      label: "Has H2/H3 Headings",
      status: hasHeadings ? "pass" : "fail",
      detail: hasHeadings ? "Subheadings found" : "No <h2> or <h3> tags",
      points: hasHeadings ? 10 : 0,
      maxPoints: 10,
    });

    // 6. Internal Links
    const hasInternalLinks = /<a\s[^>]*href=["']\/[^"']*["']/i.test(content);
    results.push({
      label: "Has Internal Links",
      status: hasInternalLinks ? "pass" : "warn",
      detail: hasInternalLinks ? "Internal links present" : 'No <a href="/..."> links found',
      points: hasInternalLinks ? 10 : 3,
      maxPoints: 10,
    });

    // 7. Image Alt Text
    const imgTags = content.match(/<img\s[^>]*>/gi) || [];
    if (imgTags.length === 0) {
      results.push({ label: "Image Alt Text", status: "pass", detail: "No images (N/A)", points: 5, maxPoints: 5 });
    } else {
      const missingAlt = imgTags.filter((tag) => !/alt=/i.test(tag));
      if (missingAlt.length === 0) {
        results.push({ label: "Image Alt Text", status: "pass", detail: `All ${imgTags.length} images have alt text`, points: 5, maxPoints: 5 });
      } else {
        results.push({ label: "Image Alt Text", status: "fail", detail: `${missingAlt.length}/${imgTags.length} images missing alt`, points: 0, maxPoints: 5 });
      }
    }

    // 8. Tags Present
    if (tagsArr.length >= 2) {
      results.push({ label: "Tags Present", status: "pass", detail: `${tagsArr.length} tags`, points: 10, maxPoints: 10 });
    } else if (tagsArr.length === 1) {
      results.push({ label: "Tags Present", status: "warn", detail: "Only 1 tag (need ≥2)", points: 5, maxPoints: 10 });
    } else {
      results.push({ label: "Tags Present", status: "fail", detail: "No tags", points: 0, maxPoints: 10 });
    }

    // 9. AI Clichés
    if (clichesFound.length === 0) {
      results.push({ label: "No AI Clichés", status: "pass", detail: "Clean writing", points: 10, maxPoints: 10 });
    } else {
      results.push({
        label: "No AI Clichés",
        status: "fail",
        detail: `Found: ${clichesFound.slice(0, 3).join(", ")}${clichesFound.length > 3 ? ` +${clichesFound.length - 3} more` : ""}`,
        points: 0,
        maxPoints: 10,
      });
    }

    // 10. First-person avoided
    const stripped = content.replace(/<[^>]*>/g, "").trim();
    const startsFirstPerson = /^(I |We )/i.test(stripped);
    if (!startsFirstPerson) {
      results.push({ label: "First-Person Avoided", status: "pass", detail: "Doesn't start with I/We", points: 10, maxPoints: 10 });
    } else {
      results.push({ label: "First-Person Avoided", status: "warn", detail: "Content starts with first-person pronoun", points: 3, maxPoints: 10 });
    }

    return results;
  }, [title, slug, summary, content, tags]);

  // ── Score Calculation ───────────────────────────────────────────────
  const { score, maxScore } = useMemo(() => {
    const total = checks.reduce((acc, c) => acc + c.points, 0);
    const max = checks.reduce((acc, c) => acc + c.maxPoints, 0);
    return { score: max > 0 ? Math.round((total / max) * 100) : 0, maxScore: max };
  }, [checks]);

  const scoreColor =
    score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-red-400";
  const barColor =
    score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-red-500";

  // ── Clichés found ──────────────────────────────────────────────────
  const clichesFound = useMemo(() => findCliches(content + " " + summary), [content, summary]);

  // ── Actions ─────────────────────────────────────────────────────────
  const handleCleanCliches = () => {
    if (onContentFix) onContentFix(cleanCliches(content));
    if (onSummaryFix) onSummaryFix(cleanCliches(summary));
  };

  const handleAutoLinkCreators = () => {
    if (!creators || creators.length === 0 || !onContentFix) return;
    let updated = content;
    for (const creator of creators) {
      // Skip if name is too short or already linked
      if (creator.name.length < 3) continue;
      const alreadyLinked = new RegExp(
        `<a\\s[^>]*href=["']/creators/${creator.id}["'][^>]*>`,
        "i"
      ).test(updated);
      if (alreadyLinked) continue;
      // Replace name occurrences NOT already inside an <a> tag
      const nameRegex = new RegExp(`(?<!<a[^>]*>)\\b(${creator.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b(?![^<]*<\\/a>)`, "gi");
      updated = updated.replace(
        nameRegex,
        `<a href="/creators/${creator.id}" class="text-[#FFD700] hover:underline font-bold">${creator.name}</a>`
      );
    }
    onContentFix(updated);
  };

  // ── Status Icon ─────────────────────────────────────────────────────
  const StatusIcon = ({ status }: { status: CheckStatus }) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case "warn":
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case "fail":
        return <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />;
    }
  };

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="glass-panel rounded-xl border border-zinc-800 shadow-2xl overflow-hidden">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-zinc-800/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-[#FFD700]" />
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            SEO Checker
          </span>
          <span className={`text-sm font-extrabold font-mono ${scoreColor}`}>
            {score}/100
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Mini bar */}
          <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor} rounded-full transition-all duration-500`}
              style={{ width: `${score}%` }}
            />
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-zinc-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          )}
        </div>
      </button>

      {/* Expandable body */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-zinc-800/60">
          {/* Score Bar */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                Overall SEO Score
              </span>
              <span className={`text-lg font-extrabold font-mono ${scoreColor}`}>
                {score}
              </span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-1">
            {checks.map((check, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg hover:bg-zinc-800/20 transition-colors"
              >
                <StatusIcon status={check.status} />
                <span className="text-[11px] font-semibold text-zinc-300 font-mono min-w-[140px]">
                  {check.label}
                </span>
                <span className="text-[10px] text-zinc-500 truncate flex-1">
                  {check.detail}
                </span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-800/50">
            <button
              type="button"
              onClick={handleCleanCliches}
              disabled={clichesFound.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold font-mono uppercase tracking-wider rounded-lg border transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 bg-amber-950/30 border-amber-800/40 text-amber-400 hover:bg-amber-900/40"
            >
              <Sparkles className="w-3 h-3" />
              Clean AI Clichés
              {clichesFound.length > 0 && (
                <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[9px] ml-0.5">
                  {clichesFound.length}
                </span>
              )}
            </button>

            {creators && creators.length > 0 && (
              <button
                type="button"
                onClick={handleAutoLinkCreators}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold font-mono uppercase tracking-wider rounded-lg border transition-all duration-200 hover:-translate-y-0.5 active:scale-95 bg-[#FFD700]/5 border-[#FFD700]/20 text-[#FFD700] hover:bg-[#FFD700]/10"
              >
                <Link2 className="w-3 h-3" />
                Auto-Link Creators
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
