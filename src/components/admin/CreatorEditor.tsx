"use client";

import React, { useState } from "react";
import { Creator } from "@/lib/mockData";
import { updateCreator, uploadImage } from "@/lib/db";

interface CreatorEditorProps {
  creators: Creator[];
  categories: string[];
  onCreatorUpdated: (updatedCreator: Creator) => void;
}

export default function CreatorEditor({ creators, categories, onCreatorUpdated }: CreatorEditorProps) {
  const [selectedCreatorId, setSelectedCreatorId] = useState("");
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [subs, setSubs] = useState(1000000);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<Creator["status"]>("Active");
  const [dramaMeter, setDramaMeter] = useState(50);
  const [dramaTitle, setDramaTitle] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [youtube, setYoutube] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleSelectCreator = (cid: string) => {
    setSelectedCreatorId(cid);
    const target = creators.find(c => c.id === cid);
    if (target) {
      setName(target.name);
      setHandle(target.handle);
      setSubs(target.subscribers);
      setCategory(target.category);
      setStatus(target.status);
      setDramaMeter(target.dramaMeter);
      setDramaTitle(target.recentDramaTitle || "");
      setAvatarUrl(target.avatarUrl);
      setBio(target.bio || "");
      setYoutube(target.socials?.youtube || "");
    } else {
      setName("");
      setHandle("");
      setSubs(1000000);
      setCategory("");
      setStatus("Active");
      setDramaMeter(50);
      setDramaTitle("");
      setAvatarUrl("");
      setBio("");
      setYoutube("");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file, "avatars");
    if (url) {
      setAvatarUrl(url);
    } else {
      alert("Avatar upload failed.");
    }
    setUploading(false);
  };

  const handleUpdateCreatorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreatorId) return;

    const updates: Partial<Creator> = {
      name,
      handle,
      subscribers: Number(subs),
      category,
      status,
      dramaMeter: Number(dramaMeter),
      recentDramaTitle: dramaTitle,
      avatarUrl,
      bio,
      socials: {
        youtube
      }
    };

    const success = await updateCreator(selectedCreatorId, updates);
    if (success) {
      const original = creators.find(c => c.id === selectedCreatorId);
      if (original) {
        onCreatorUpdated({
          ...original,
          ...updates,
          socials: {
            ...original.socials,
            youtube
          }
        });
      }
      alert("Creator updated successfully!");
    } else {
      alert("Failed to update creator profile.");
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-zinc-800 shadow-2xl">
      <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-4">
        ✏️ Edit Creator Profile
      </h2>
      <form onSubmit={handleUpdateCreatorSubmit} className="space-y-4">
        <div>
          <label htmlFor="edit-creator-select" className="text-xs text-zinc-400 font-mono block mb-1">Select YouTuber</label>
          <select
            id="edit-creator-select"
            value={selectedCreatorId}
            onChange={(e) => handleSelectCreator(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-350 focus:border-[#FFD700] outline-none"
          >
            <option value="">Choose creator to edit...</option>
            {creators.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.handle})</option>
            ))}
          </select>
        </div>

        {selectedCreatorId && (
          <div className="space-y-3 pt-2 border-t border-zinc-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label htmlFor="edit-name-input" className="text-[10px] text-zinc-500 font-mono block mb-0.5">Name</label>
                <input 
                  id="edit-name-input"
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#FFD700]"
                />
              </div>
              <div>
                <label htmlFor="edit-handle-input" className="text-[10px] text-zinc-500 font-mono block mb-0.5">Handle</label>
                <input 
                  id="edit-handle-input"
                  type="text" 
                  value={handle} 
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#FFD700]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label htmlFor="edit-subs-input" className="text-[10px] text-zinc-500 font-mono block mb-0.5">Subscribers</label>
                <input 
                  id="edit-subs-input"
                  type="number" 
                  value={subs} 
                  onChange={(e) => setSubs(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-855 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#FFD700]"
                />
              </div>
              <div>
                <label htmlFor="edit-category-select" className="text-[10px] text-zinc-500 font-mono block mb-0.5">Category</label>
                <select
                  id="edit-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-855 rounded px-2 py-1 text-xs text-zinc-300 outline-none focus:border-[#FFD700]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label htmlFor="edit-status-select" className="text-[10px] text-zinc-500 font-mono block mb-0.5">Status</label>
                <select
                  id="edit-status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Creator["status"])}
                  className="w-full bg-zinc-900 border border-zinc-855 rounded px-2 py-1 text-xs text-zinc-300 outline-none focus:border-[#FFD700]"
                >
                  <option value="Active">Active</option>
                  <option value="Hiatus">Hiatus</option>
                  <option value="Drama/Exposed">Drama/Exposed</option>
                  <option value="Under Investigation">Under Investigation</option>
                </select>
              </div>
              <div>
                <label htmlFor="edit-youtube-input" className="text-[10px] text-zinc-500 font-mono block mb-0.5">YouTube URL</label>
                <input 
                  id="edit-youtube-input"
                  type="text" 
                  value={youtube} 
                  onChange={(e) => setYoutube(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-855 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#FFD700]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-avatar-input" className="text-[10px] text-zinc-500 font-mono block mb-0.5">
                Avatar Image {uploading ? "(Uploading...)" : "(URL or Upload)"}
              </label>
              <input 
                id="edit-avatar-input"
                type="text" 
                value={avatarUrl} 
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-855 rounded px-2 py-1 text-[11px] text-white outline-none focus:border-[#FFD700] mb-1"
              />
              <input
                type="file"
                accept="image/*"
                aria-label="Upload avatar image file"
                onChange={handleAvatarUpload}
                className="text-[10px] text-zinc-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-750 cursor-pointer block w-full"
              />
            </div>

            <div>
              <label htmlFor="edit-bio-input" className="text-[10px] text-zinc-500 font-mono block mb-0.5">Bio</label>
              <textarea 
                id="edit-bio-input"
                value={bio} 
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full bg-zinc-900 border border-zinc-850 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#FFD700]"
              />
            </div>

            <div>
              <label htmlFor="edit-drama-slider" className="text-[10px] text-zinc-500 font-mono block mb-0.5">Drama Heat index ({dramaMeter}%)</label>
              <input 
                id="edit-drama-slider"
                type="range" 
                min="0" 
                max="100" 
                value={dramaMeter} 
                onChange={(e) => setDramaMeter(Number(e.target.value))}
                className="w-full accent-[#FFD700] bg-zinc-900 border border-zinc-800 rounded h-1.5"
              />
            </div>

            <div>
              <label htmlFor="edit-drama-title" className="text-[10px] text-zinc-500 font-mono block mb-0.5">Recent Drama Tagline</label>
              <input 
                id="edit-drama-title"
                type="text" 
                value={dramaTitle} 
                onChange={(e) => setDramaTitle(e.target.value)}
                placeholder="Alert text..."
                className="w-full bg-zinc-900 border border-zinc-855 rounded px-2 py-1 text-xs text-white outline-none focus:border-[#FFD700]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#FFD700]/10 border border-[#FFD700]/30 hover:bg-[#FFD700]/20 text-[#FFD700] font-semibold text-xs py-2.5 rounded transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 hover:shadow-[0_2px_10px_rgba(255,215,0,0.1)] mt-2"
            >
              Apply Live Update
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
