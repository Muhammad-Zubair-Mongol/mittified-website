"use client";

import React, { useState } from "react";
import { Article } from "@/lib/mockData";
import { updateArticle } from "@/lib/db";

interface ArticleEditorProps {
  articles: Article[];
  categories: string[];
  onArticleUpdated: (updatedArticle: Article) => void;
}

export default function ArticleEditor({ articles, categories, onArticleUpdated }: ArticleEditorProps) {
  const [selectedArticleId, setSelectedArticleId] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0] || "Controversies");
  const [summary, setSummary] = useState("");

  const handleSelectArticle = (aid: string) => {
    setSelectedArticleId(aid);
    const target = articles.find(a => a.id === aid);
    if (target) {
      setTitle(target.title);
      setCategory(target.category);
      setSummary(target.summary || "");
    } else {
      setTitle("");
      setCategory(categories[0] || "Controversies");
      setSummary("");
    }
  };

  const handleUpdateArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticleId) return;

    const updates: Partial<Article> = {
      title,
      category,
      summary
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
              <label htmlFor="edit-art-summary" className="text-[10px] text-zinc-500 font-mono block mb-0.5">Short Summary</label>
              <textarea 
                id="edit-art-summary"
                value={summary} 
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-850 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#FFD700]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#FFD700]/10 border border-[#FFD700]/30 hover:bg-[#FFD700]/20 text-[#FFD700] font-semibold text-xs py-2.5 rounded transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 hover:shadow-[0_2px_10px_rgba(255,215,0,0.1)] mt-2"
            >
              Apply Article Update
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
