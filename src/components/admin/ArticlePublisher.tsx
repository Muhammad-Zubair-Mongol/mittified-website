"use client";

import React, { useState } from "react";
import { FileText, Send } from "lucide-react";
import SEOChecker from "./SEOChecker";
import { Creator, Article } from "@/lib/mockData";
import { addArticle, uploadImage, getNextActiveKey } from "@/lib/db";

interface PublishInvestigationProps {
  creators: Creator[];
  selectedModel: string;
  categories: string[];
  onArticlePublished: (article: Article) => void;
}

export default function ArticlePublisher({ creators, selectedModel, categories, onArticlePublished }: PublishInvestigationProps) {
  const [artTitle, setArtTitle] = useState("");
  const [artSlug, setArtSlug] = useState("");
  const [artSummary, setArtSummary] = useState("");
  const [artContent, setArtContent] = useState("");
  const [artCover, setArtCover] = useState("");
  const [artCategory, setArtCategory] = useState(categories[0] || "Controversies");

  React.useEffect(() => {
    if (categories && categories.length > 0 && !categories.includes(artCategory)) {
      setArtCategory(categories[0]);
    }
  }, [categories, artCategory]);
  const [artTags, setArtTags] = useState("");
  const [artVideoId, setArtVideoId] = useState("");
  const [selectedCreatorId, setSelectedCreatorId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, folder: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const url = await uploadImage(file, folder);
    if (url) {
      setArtCover(url);
    } else {
      alert("Image upload failed.");
    }
    setUploading(false);
  };

  const handleGenerateContent = async () => {
    if (!artTitle.trim()) {
      alert("Please enter an Article Title first to generate content.");
      return;
    }

    setIsGenerating(true);
    try {
      const activeKey = await getNextActiveKey();
      if (!activeKey) {
        alert("No API keys found in the rotation pool. Please paste some API keys below first.");
        setIsGenerating(false);
        return;
      }

      const promptText = `You are a senior investigative journalist at a top-tier media outlet covering Pakistani YouTube creators.

Write a sharp, punchy article based on this title: "${artTitle}"

Rules:
- Write like a human journalist, NOT like AI. Use active voice, short sentences, concrete details.
- NEVER use these words/phrases: delve, tapestry, testament, landscape, furthermore, moreover, paradigm, leverage, synergy, game-changer, deep dive, unpack, "it's important to note", "in today's digital age", "at the end of the day", "needless to say"
- Start with a bold, attention-grabbing lede paragraph (no generic intros)
- Use specific numbers, dates, and names when possible
- Include at least 2 subheadings using <h2> tags
- Write 300-500 words minimum
- End with a forward-looking statement, not a generic conclusion
- Make it feel urgent and newsworthy

You MUST return a valid JSON object only. Do not wrap in markdown code block markers. Just return the raw JSON:
{
  "summary": "Punchy meta description, max 155 characters, include a hook",
  "content": "Full HTML article with <p>, <strong>, <h2>, <h3> tags. Min 300 words.",
  "category": "Controversies" | "Milestones" | "Analysis",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4"]
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${activeKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: promptText,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error("No content generated in the response.");
      }

      let cleanText = rawText.trim();
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText.substring(7);
      }
      if (cleanText.endsWith("```")) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
      }
      cleanText = cleanText.trim();

      const parsed = JSON.parse(cleanText);
      if (parsed.summary) setArtSummary(parsed.summary);
      if (parsed.content) setArtContent(parsed.content);
      if (parsed.category) setArtCategory(parsed.category);
      if (parsed.tags) {
        if (Array.isArray(parsed.tags)) {
          setArtTags(parsed.tags.join(", "));
        } else {
          setArtTags(parsed.tags);
        }
      }
      
      setArtSlug(artTitle.toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9-]/g, ""));
      
      alert("Content auto-generated successfully using model: " + selectedModel);
    } catch (e) {
      console.error("AI Generation Error", e);
      alert("AI Generation failed: " + (e as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle || !artSlug || !artContent) {
      alert("Please fill out Title, Slug, and Content.");
      return;
    }

    const tagsArray = artTags.split(",").map(t => t.trim()).filter(Boolean);

    const newArt = await addArticle({
      title: artTitle,
      slug: artSlug.toLowerCase().replace(/ /g, "-"),
      summary: artSummary,
      content: artContent,
      coverImage: artCover || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=600",
      category: artCategory,
      tags: tagsArray,
      author: "Mitti Fied Admin",
      creatorId: selectedCreatorId || undefined,
      youtubeVideoId: artVideoId || undefined
    });

    if (newArt) {
      onArticlePublished(newArt);
      alert("Article posted successfully!");
      // Reset form
      setArtTitle("");
      setArtSlug("");
      setArtSummary("");
      setArtContent("");
      setArtCover("");
      setArtTags("");
      setArtVideoId("");
      setSelectedCreatorId("");
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-zinc-800 shadow-2xl">
      <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-6 border-b border-zinc-800 pb-3">
        <FileText className="text-[#FFD700] w-5 h-5" /> Publish New Investigation
      </h2>
      
      <form onSubmit={handleAddArticleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="art-title-input" className="text-xs text-zinc-400 font-mono block mb-1">Article Title</label>
            <div className="flex gap-2">
              <input 
                id="art-title-input"
                type="text" 
                value={artTitle} 
                onChange={(e) => {
                  setArtTitle(e.target.value);
                  setArtSlug(e.target.value.toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9-]/g, ""));
                }}
                placeholder="e.g. Raza Samo Podcast Fallout Explored"
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white placeholder-zinc-650 focus:border-[#FFD700] outline-none"
              />
              <button
                type="button"
                onClick={handleGenerateContent}
                disabled={isGenerating}
                className="px-3 py-2 bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]/30 rounded text-xs font-semibold font-mono tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:scale-95 active:translate-y-0 disabled:opacity-50 shrink-0 flex items-center gap-1.5"
              >
                {isGenerating ? "Generating..." : "✨ Auto-Fill"}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="art-slug-input" className="text-xs text-zinc-400 font-mono block mb-1">Slug URL</label>
            <input 
              id="art-slug-input"
              type="text" 
              value={artSlug} 
              onChange={(e) => setArtSlug(e.target.value)}
              placeholder="raza-samo-podcast-clash"
              className="w-full bg-zinc-900 border border-zinc-850 rounded px-3 py-2 text-sm text-white placeholder-zinc-650 focus:border-[#FFD700] outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="art-summary-input" className="text-xs text-zinc-400 font-mono block mb-1">Short Summary</label>
          <input 
            id="art-summary-input"
            type="text" 
            value={artSummary} 
            onChange={(e) => setArtSummary(e.target.value)}
            placeholder="Provide a quick 2-line hook for search engine previews"
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white placeholder-zinc-650 focus:border-[#FFD700] outline-none"
          />
        </div>

        <div>
          <label htmlFor="art-content-input" className="text-xs text-zinc-400 font-mono block mb-1">Content (HTML allowed)</label>
          <textarea 
            id="art-content-input"
            value={artContent} 
            onChange={(e) => setArtContent(e.target.value)}
            rows={8}
            placeholder="<p>Detailed expos&eacute; text goes here...</p>"
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white placeholder-zinc-650 focus:border-[#FFD700] outline-none font-mono"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="art-cover-input" className="text-xs text-zinc-400 font-mono block mb-1">
              Cover Image {uploading ? "(Uploading...)" : "(URL or Upload)"}
            </label>
            <input 
              id="art-cover-input"
              type="text" 
              value={artCover} 
              onChange={(e) => setArtCover(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white placeholder-zinc-650 focus:border-[#FFD700] outline-none mb-1.5"
            />
            {artCover && (
              <div className="relative w-full h-24 mb-2 rounded border border-zinc-800 overflow-hidden bg-zinc-950 flex items-center justify-center group">
                <div 
                  className="absolute inset-0 bg-cover bg-center filter blur-md opacity-30 scale-105"
                  style={{ backgroundImage: `url(${artCover})` }}
                />
                <img 
                  key={artCover}
                  src={artCover} 
                  alt="Cover Preview" 
                  className="relative z-10 max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setArtCover("")}
                  className="absolute top-1 right-1 bg-red-950/80 border border-red-800 hover:bg-red-900 text-white rounded px-2 py-0.5 text-[9px] font-bold transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              aria-label="Upload cover image file"
              onChange={(e) => handleImageUpload(e, "covers")}
              className="text-[10px] text-zinc-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-750 cursor-pointer block w-full"
            />
          </div>
          <div>
            <label htmlFor="art-category-select" className="text-xs text-zinc-400 font-mono block mb-1">Category</label>
            <select
              id="art-category-select"
              value={artCategory}
              onChange={(e) => setArtCategory(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 focus:border-[#FFD700] outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="art-tags-input" className="text-xs text-zinc-400 font-mono block mb-1">Tags (comma separated)</label>
            <input 
              id="art-tags-input"
              type="text" 
              value={artTags} 
              onChange={(e) => setArtTags(e.target.value)}
              placeholder="Ducky Bhai, Roast, Vlog"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white placeholder-zinc-650 focus:border-[#FFD700] outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="art-video-input" className="text-xs text-zinc-400 font-mono block mb-1">YouTube Video ID (Optional embed)</label>
            <input 
              id="art-video-input"
              type="text" 
              value={artVideoId} 
              onChange={(e) => setArtVideoId(e.target.value)}
              placeholder="dQw4w9WgXcQ"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white placeholder-zinc-655 focus:border-[#FFD700] outline-none"
            />
          </div>
          <div>
            <label htmlFor="art-creator-select" className="text-xs text-zinc-400 font-mono block mb-1">Link to Creator (Optional)</label>
            <select
              id="art-creator-select"
              value={selectedCreatorId}
              onChange={(e) => setSelectedCreatorId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 focus:border-[#FFD700] outline-none"
            >
              <option value="">Select linked creator...</option>
              {creators.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.handle})</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#FFD700] hover:bg-[#ffe234] text-zinc-950 font-extrabold text-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 hover:shadow-[0_4px_20px_rgba(255,215,0,0.25)] mt-4"
        >
          <Send className="w-4 h-4" /> Publish Article & Sync Edges
        </button>
      </form>

      {/* SEO Analysis */}
      <div className="mt-6">
        <SEOChecker
          title={artTitle}
          slug={artSlug}
          summary={artSummary}
          content={artContent}
          tags={artTags}
          creators={creators}
          onContentFix={(fixed) => setArtContent(fixed)}
          onSummaryFix={(fixed) => setArtSummary(fixed)}
        />
      </div>
    </div>
  );
}
