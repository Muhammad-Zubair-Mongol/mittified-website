"use client";

import React, { useState, useEffect } from "react";
import { Film } from "lucide-react";
import { Creator } from "@/lib/mockData";
import { addCreator, uploadImage } from "@/lib/db";

interface AddCreatorProps {
  categories: string[];
  onCreatorAdded: (creator: Creator) => void;
}

export default function AddCreatorForm({ categories, onCreatorAdded }: AddCreatorProps) {
  const [creatorName, setCreatorName] = useState("");
  const [creatorHandle, setCreatorHandle] = useState("");
  const [creatorSubs, setCreatorSubs] = useState(1000000);
  const [creatorCategory, setCreatorCategory] = useState("");
  const [creatorAvatar, setCreatorAvatar] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (categories.length > 0 && !creatorCategory) {
      setCreatorCategory(categories[0]);
    }
  }, [categories, creatorCategory]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file, "avatars");
    if (url) {
      setCreatorAvatar(url);
    } else {
      alert("Avatar upload failed.");
    }
    setUploading(false);
  };

  const handleAddCreatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorName || !creatorHandle) {
      alert("Name and Handle are required.");
      return;
    }

    const newC = await addCreator({
      name: creatorName,
      handle: creatorHandle,
      channelId: `UC-${Math.random().toString(36).substr(2, 9)}`,
      avatarUrl: creatorAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
      subscribers: creatorSubs,
      category: creatorCategory || (categories[0] || "Vlogger"),
      status: "Active",
      dramaMeter: 0,
      metrics: {
        monthlyViews: 500000,
        engagementRate: 5.0
      },
      bio: `${creatorName} is a tracked channel in the Pakistan YouTube ecosystem.`,
      socials: {
        youtube: `https://youtube.com/${creatorHandle}`
      }
    });

    if (newC) {
      onCreatorAdded(newC);
      alert("Creator added successfully!");
      setCreatorName("");
      setCreatorHandle("");
      setCreatorAvatar("");
      setCreatorSubs(1000000);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-zinc-800 shadow-2xl">
      <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-6 border-b border-zinc-800 pb-3">
        <Film className="text-[#FFD700] w-5 h-5" /> Add Creator to Database
      </h2>
      <form onSubmit={handleAddCreatorSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="creator-name-input" className="text-xs text-zinc-400 font-mono block mb-1">Creator Name</label>
            <input 
              id="creator-name-input"
              type="text" 
              value={creatorName} 
              onChange={(e) => setCreatorName(e.target.value)}
              placeholder="e.g. Sham Idrees"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-[#FFD700] outline-none"
            />
          </div>
          <div>
            <label htmlFor="creator-handle-input" className="text-xs text-zinc-400 font-mono block mb-1">Handle</label>
            <input 
              id="creator-handle-input"
              type="text" 
              value={creatorHandle} 
              onChange={(e) => setCreatorHandle(e.target.value)}
              placeholder="@shamvlogs"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-[#FFD700] outline-none"
            />
          </div>
          <div>
            <label htmlFor="creator-subs-input" className="text-xs text-zinc-400 font-mono block mb-1">Subscribers Count</label>
            <input 
              id="creator-subs-input"
              type="number" 
              value={creatorSubs} 
              onChange={(e) => setCreatorSubs(Number(e.target.value))}
              placeholder="1000000"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-[#FFD700] outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="creator-category-select" className="text-xs text-zinc-400 font-mono block mb-1">Category</label>
            <select
              id="creator-category-select"
              value={creatorCategory}
              onChange={(e) => setCreatorCategory(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 focus:border-[#FFD700] outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="creator-avatar-input" className="text-xs text-zinc-400 font-mono block mb-1">
              Avatar Image {uploading ? "(Uploading...)" : "(URL or Upload)"}
            </label>
            <input 
              id="creator-avatar-input"
              type="text" 
              value={creatorAvatar} 
              onChange={(e) => setCreatorAvatar(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white placeholder-zinc-650 focus:border-[#FFD700] outline-none mb-1.5"
            />
            <input
              type="file"
              accept="image/*"
              aria-label="Upload avatar image file"
              onChange={handleAvatarUpload}
              className="text-[10px] text-zinc-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-750 cursor-pointer block w-full"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 border border-zinc-800 rounded-lg shadow-sm text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 hover:border-[#FFD700]/30 hover:shadow-[0_0_15px_rgba(255,215,0,0.07)] font-mono tracking-wide flex items-center justify-center gap-1.5 h-[38px]"
          >
            <Film className="w-4 h-4 text-[#FFD700]" /> Add Creator
          </button>
        </div>
      </form>
    </div>
  );
}
