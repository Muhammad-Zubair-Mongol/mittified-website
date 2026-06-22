"use client";

import React, { useState } from "react";
import { Article, Creator } from "@/lib/mockData";
import { updateArticle, uploadImage } from "@/lib/db";
import SEOChecker from "./SEOChecker";

interface ArticleEditorProps {
  articles: Article[];
  categories: string[];
  creators?: Creator[];
  onArticleUpdated: (updatedArticle: Article) => void;
}

export default function ArticleEditor({ articles, categories, creators, onArticleUpdated }: ArticleEditorProps) {
  const [selectedArticleId, setSelectedArticleId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState(categories[0] || "Controversies");
  const [summary, setSummary] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [youtubeVideoId, setYoutubeVideoId] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSelectArticle = (aid: string) => {
    setSelectedArticleId(aid);
    const target = articles.find(a => a.id === aid);
    if (target) {
      setTitle(target.title);
      setSlug(target.slug || "");
      setCategory(target.category);
      setSummary(target.summary || "");
      setCoverImage(target.coverImage || "");
      setContent(target.content || "");
      setTags(target.tags ? target.tags.join(", ") : "");
      setYoutubeVideoId(target.youtubeVideoId || "");
    } else {
      setTitle("");
      setSlug("");
      setCategory(categories[0] || "Controversies");
      setSummary("");
      setCoverImage("");
      setContent("");
      setTags("");
      setYoutubeVideoId("");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const url = await uploadImage(file, "covers");
    if (url) {
      setCoverImage(url);
    } else {
      alert("Image upload failed.");
    }
    setUploading(false);
  };

  const handleUpdateArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticleId) return;

    const tagsArray = tags.split(",").map(t => t.trim()).filter(Boolean);

    const updates: Partial<Article> = {
      title,
      category,
      summary,
      coverImage,
      content,
      tags: tagsArray,
      youtubeVideoId: youtubeVideoId || ""
    };

    const success = await updateArticle(selectedArticleId, updates);
    if (success) {
      const original = articles.find(a => a.id === selectedArticleId);
      if (original) {
        onArticleUpdated({
          ...original,
          ...updates
        });
      }
      alert("Article updated successfully!");
    } else {
      alert("Failed to update article.");
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-zinc-800 shadow-2xl">
      <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-4">
        ✏️ Edit Published Article
      </h2>
      <form onSubmit={handleUpdateArticleSubmit} className="space-y-4">
        <div>
          <label htmlFor="edit-article-select" className="text-xs text-zinc-400 font-mono block mb-1">Select Article</label>
          <select
            id="edit-article-select"
            value={selectedArticleId}
            onChange={(e) => handleSelectArticle(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-350 focus:border-[#FFD700] outline-none"
          >
            <option value="">Choose article to edit...</option>
            {articles.map(a => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
        </div>

        {selectedArticleId && (
          <div className="space-y-3 pt-2 border-t border-zinc-900">
            <div>
              <label htmlFor="edit-art-title" className="text-[10px] text-zinc-500 font-mono block mb-0.5">Title</label>
              <input 
                id="edit-art-title"
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-850 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#FFD700]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label htmlFor="edit-art-category" className="text-[10px] text-zinc-500 font-mono block mb-0.5">Category</label>
                <select
                  id="edit-art-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-855 rounded px-2 py-1 text-xs text-zinc-350 outline-none focus:border-[#FFD700]"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="edit-art-tags" className="text-[10px] text-zinc-500 font-mono block mb-0.5">Tags (comma separated)</label>
                <input 
                  id="edit-art-tags"
                  type="text" 
                  value={tags} 
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Ducky Bhai, Roast"
                  className="w-full bg-zinc-900 border border-zinc-855 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#FFD700]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-art-summary" className="text-[10px] text-zinc-500 font-mono block mb-0.5">Short Summary</label>
              <textarea 
                id="edit-art-summary"
                value={summary} 
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-850 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#FFD700]"
              />
            </div>

            <div>
              <label htmlFor="edit-art-content" className="text-[10px] text-zinc-500 font-mono block mb-0.5">Content (HTML allowed)</label>
              <textarea 
                id="edit-art-content"
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="w-full bg-zinc-900 border border-zinc-850 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#FFD700] font-mono"
              />
            </div>

            <div>
              <label htmlFor="edit-art-video" className="text-[10px] text-zinc-500 font-mono block mb-0.5">YouTube Video ID (Optional)</label>
              <input 
                id="edit-art-video"
                type="text" 
                value={youtubeVideoId} 
                onChange={(e) => setYoutubeVideoId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-855 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#FFD700]"
              />
            </div>

            <div>
              <label htmlFor="edit-art-cover" className="text-[10px] text-zinc-500 font-mono block mb-0.5">
                Cover Image {uploading ? "(Uploading...)" : "(URL or Upload)"}
              </label>
              <input 
                id="edit-art-cover"
                type="text" 
                value={coverImage} 
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-855 rounded px-2 py-1 text-[11px] text-white outline-none focus:border-[#FFD700] mb-1"
              />
              {coverImage && (
                <div className="relative w-full h-20 mb-2 rounded border border-zinc-800 overflow-hidden bg-zinc-950 flex items-center justify-center group">
                  <div 
                    className="absolute inset-0 bg-cover bg-center filter blur-md opacity-30 scale-105"
                    style={{ backgroundImage: `url(${coverImage})` }}
                  />
                  <img 
                    key={coverImage}
                    src={coverImage} 
                    alt="Cover Preview" 
                    className="relative z-10 max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImage("")}
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
                onChange={handleImageUpload}
                className="text-[10px] text-zinc-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-750 cursor-pointer block w-full"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#FFD700]/10 border border-[#FFD700]/30 hover:bg-[#FFD700]/20 text-[#FFD700] font-semibold text-xs py-2.5 rounded transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 hover:shadow-[0_2px_10px_rgba(255,215,0,0.1)] mt-2"
            >
              Apply Article Update
            </button>

            {/* SEO Analysis */}
            <div className="mt-4">
              <SEOChecker
                title={title}
                slug={slug}
                summary={summary}
                content={content}
                tags={tags}
                creators={creators}
                onContentFix={(fixed) => setContent(fixed)}
                onSummaryFix={(fixed) => setSummary(fixed)}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
