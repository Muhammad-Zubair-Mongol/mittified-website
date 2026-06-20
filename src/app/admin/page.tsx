"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  getCreators, 
  getArticles, 
  addArticle, 
  updateCreatorDramaMeter, 
  addCreator,
  getWhitelistedAdmins,
  addWhitelistedAdmin,
  removeWhitelistedAdmin,
  getNavLinks,
  saveNavLinks,
  getRotatingKeys,
  saveRotatingKeys,
  NavLink
} from "@/lib/supabase";
import { auth, verifyAdminWhitelist, uploadImage } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Creator, Article } from "@/lib/mockData";
import { ShieldCheck, PlusCircle, LayoutDashboard, Film, FileText, Send, LogOut, Key, Link2, Trash2 } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Lists
  const [creators, setCreators] = useState<Creator[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  // Whitelist admin states
  const [whitelistEmails, setWhitelistEmails] = useState<string[]>([]);
  const [newWhitelistEmail, setNewWhitelistEmail] = useState("");

  // Navigation link states
  const [navLinksList, setNavLinksList] = useState<NavLink[]>([]);
  const [newNavLinkLabel, setNewNavLinkLabel] = useState("");
  const [newNavLinkHref, setNewNavLinkHref] = useState("");

  // Rotating keys states
  const [apiKeysInput, setApiKeysInput] = useState("");

  // Update states
  const [selectedCreatorId, setSelectedCreatorId] = useState("");
  const [newDramaMeter, setNewDramaMeter] = useState(50);
  const [newDramaTitle, setNewDramaTitle] = useState("");

  // Create article form states
  const [artTitle, setArtTitle] = useState("");
  const [artSlug, setArtSlug] = useState("");
  const [artSummary, setArtSummary] = useState("");
  const [artContent, setArtContent] = useState("");
  const [artCover, setArtCover] = useState("");
  const [artCategory, setArtCategory] = useState("Controversies");
  const [artTags, setArtTags] = useState("");
  const [artVideoId, setArtVideoId] = useState("");
  const [uploading, setUploading] = useState(false);

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

  // Create creator states
  const [creatorName, setCreatorName] = useState("");
  const [creatorHandle, setCreatorHandle] = useState("");
  const [creatorSubs, setCreatorSubs] = useState(1000000);
  const [creatorCategory, setCreatorCategory] = useState<Creator["category"]>("Vlogger");

  useEffect(() => {
    if (auth) {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          const isWhitelisted = await verifyAdminWhitelist(user.email);
          if (isWhitelisted) {
            setAuthorized(true);
            loadData();
          } else {
            await signOut(auth!);
            router.push("/login");
          }
        } else {
          router.push("/login");
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Simulate local login fallback
      const session = localStorage.getItem("mittified_session");
      if (session) {
        const userObj = JSON.parse(session);
        verifyAdminWhitelist(userObj.user?.email).then((isWhitelisted) => {
          if (isWhitelisted) {
            setAuthorized(true);
            loadData();
          } else {
            router.push("/login");
          }
          setLoading(false);
        });
      } else {
        router.push("/login");
        setLoading(false);
      }
    }
  }, [router]);

  async function loadData() {
    const cData = await getCreators();
    const aData = await getArticles();
    setCreators(cData);
    setArticles(aData);

    const admins = await getWhitelistedAdmins();
    setWhitelistEmails(admins);

    const links = await getNavLinks();
    setNavLinksList(links);

    const keys = await getRotatingKeys();
    setApiKeysInput(keys.join("\n"));
  }

  const handleAddWhitelistEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhitelistEmail.trim()) return;
    const success = await addWhitelistedAdmin(newWhitelistEmail);
    if (success) {
      setWhitelistEmails(prev => [...prev, newWhitelistEmail.toLowerCase().trim()]);
      setNewWhitelistEmail("");
      alert("Admin email whitelisted successfully!");
    }
  };

  const handleRemoveWhitelistEmail = async (email: string) => {
    if (email.toLowerCase() === "mittifiedbusiness@gmail.com") {
      alert("Cannot remove the master bypass administrator email.");
      return;
    }
    const success = await removeWhitelistedAdmin(email);
    if (success) {
      setWhitelistEmails(prev => prev.filter(e => e !== email));
      alert("Admin email removed from whitelist.");
    }
  };

  const handleAddNavLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNavLinkLabel.trim() || !newNavLinkHref.trim()) return;
    const updated = [...navLinksList, { label: newNavLinkLabel, href: newNavLinkHref }];
    const success = await saveNavLinks(updated);
    if (success) {
      setNavLinksList(updated);
      setNewNavLinkLabel("");
      setNewNavLinkHref("");
      alert("Navigation link added!");
    }
  };

  const handleRemoveNavLink = async (index: number) => {
    const updated = navLinksList.filter((_, i) => i !== index);
    const success = await saveNavLinks(updated);
    if (success) {
      setNavLinksList(updated);
      alert("Navigation link removed!");
    }
  };

  const handleSaveApiKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    const keysArray = apiKeysInput.split("\n").map(k => k.trim()).filter(Boolean);
    const success = await saveRotatingKeys(keysArray);
    if (success) {
      alert("Rotating API keys updated successfully!");
    }
  };

  const handleUpdateDrama = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreatorId) return;

    await updateCreatorDramaMeter(selectedCreatorId, Number(newDramaMeter));
    
    // Update local list
    setCreators(prev => prev.map(c => {
      if (c.id === selectedCreatorId) {
        return { 
          ...c, 
          dramaMeter: Number(newDramaMeter), 
          recentDramaTitle: newDramaTitle || c.recentDramaTitle 
        };
      }
      return c;
    }));

    alert("Drama meter updated successfully!");
    setNewDramaTitle("");
  };

  const handleAddArticle = async (e: React.FormEvent) => {
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
      setArticles(prev => [newArt, ...prev]);
      alert("Article posted successfully!");
      // Reset form
      setArtTitle("");
      setArtSlug("");
      setArtSummary("");
      setArtContent("");
      setArtCover("");
      setArtTags("");
      setArtVideoId("");
    }
  };

  const handleAddCreator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorName || !creatorHandle) {
      alert("Name and Handle are required.");
      return;
    }

    const newC = await addCreator({
      name: creatorName,
      handle: creatorHandle,
      channelId: `UC-${Math.random().toString(36).substr(2, 9)}`,
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
      subscribers: creatorSubs,
      category: creatorCategory,
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
      setCreators(prev => [...prev, newC]);
      alert("Creator added successfully!");
      setCreatorName("");
      setCreatorHandle("");
    }
  };

  const handleLogOut = () => {
    if (auth) {
      signOut(auth!);
    } else {
      localStorage.removeItem("mittified_session");
    }
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Admin header */}
      <header className="bg-zinc-900 border-b border-zinc-800 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-[#FFD700] w-6 h-6" />
          <div>
            <h1 className="text-lg font-black tracking-tight font-mono text-white">MITTIFIED SYSTEM CONSOLE</h1>
            <p className="text-[10px] text-zinc-500 font-mono">Authenticated Admin Privileges</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs text-zinc-400 hover:text-white font-mono uppercase">
            Exit Console
          </Link>
          <button 
            onClick={handleLogOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Input Form Areas (Col span 2) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Form: Add Blog Article */}
            <div className="glass-panel p-6 rounded-xl border border-zinc-800 shadow-2xl">
              <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-6 border-b border-zinc-800 pb-3">
                <FileText className="text-[#FFD700] w-5 h-5" /> Publish New Investigation
              </h2>
              
              <form onSubmit={handleAddArticle} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 font-mono block mb-1">Article Title</label>
                    <input 
                      type="text" 
                      value={artTitle} 
                      onChange={(e) => {
                        setArtTitle(e.target.value);
                        setArtSlug(e.target.value.toLowerCase().replace(/ /g, "-").replace(/[^a-z0-9-]/g, ""));
                      }}
                      placeholder="e.g. Raza Samo Podcast Fallout Explored"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#FFD700] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-mono block mb-1">Slug URL</label>
                    <input 
                      type="text" 
                      value={artSlug} 
                      onChange={(e) => setArtSlug(e.target.value)}
                      placeholder="raza-samo-podcast-clash"
                      className="w-full bg-zinc-900 border border-zinc-850 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#FFD700] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-mono block mb-1">Short Summary</label>
                  <input 
                    type="text" 
                    value={artSummary} 
                    onChange={(e) => setArtSummary(e.target.value)}
                    placeholder="Provide a quick 2-line hook for search engine previews"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#FFD700] outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-mono block mb-1">Content (HTML allowed)</label>
                  <textarea 
                    value={artContent} 
                    onChange={(e) => setArtContent(e.target.value)}
                    rows={8}
                    placeholder="<p>Detailed expos&eacute; text goes here...</p>"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#FFD700] outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 font-mono block mb-1">
                      Cover Image {uploading ? "(Uploading...)" : "(URL or Upload)"}
                    </label>
                    <input 
                      type="text" 
                      value={artCover} 
                      onChange={(e) => setArtCover(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-xs text-white placeholder-zinc-650 focus:border-[#FFD700] outline-none mb-1.5"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "covers")}
                      className="text-[10px] text-zinc-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-750 cursor-pointer block w-full"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-mono block mb-1">Category</label>
                    <select
                      value={artCategory}
                      onChange={(e) => setArtCategory(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 focus:border-[#FFD700] outline-none"
                    >
                      <option value="Controversies">Controversies</option>
                      <option value="Milestones">Milestones</option>
                      <option value="Analysis">Analysis</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-mono block mb-1">Tags (comma separated)</label>
                    <input 
                      type="text" 
                      value={artTags} 
                      onChange={(e) => setArtTags(e.target.value)}
                      placeholder="Ducky Bhai, Roast, Vlog"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#FFD700] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 font-mono block mb-1">YouTube Video ID (Optional embed)</label>
                    <input 
                      type="text" 
                      value={artVideoId} 
                      onChange={(e) => setArtVideoId(e.target.value)}
                      placeholder="dQw4w9WgXcQ"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-[#FFD700] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-mono block mb-1">Link to Creator (Optional)</label>
                    <select
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
                  className="w-full bg-[#FFD700] hover:bg-[#ffe234] text-zinc-950 font-extrabold text-sm py-3 rounded-lg flex items-center justify-center gap-2 transition-all mt-4"
                >
                  <Send className="w-4 h-4" /> Publish Article & Sync Edges
                </button>
              </form>
            </div>

            {/* Form: Add Creator */}
            <div className="glass-panel p-6 rounded-xl border border-zinc-800 shadow-2xl">
              <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-6 border-b border-zinc-800 pb-3">
                <Film className="text-[#FFD700] w-5 h-5" /> Add Creator to Database
              </h2>
              <form onSubmit={handleAddCreator} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="text-xs text-zinc-400 font-mono block mb-1">Creator Name</label>
                  <input 
                    type="text" 
                    value={creatorName} 
                    onChange={(e) => setCreatorName(e.target.value)}
                    placeholder="e.g. Sham Idrees"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-[#FFD700] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-mono block mb-1">Handle</label>
                  <input 
                    type="text" 
                    value={creatorHandle} 
                    onChange={(e) => setCreatorHandle(e.target.value)}
                    placeholder="@shamvlogs"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:border-[#FFD700] outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm py-2 px-4 rounded border border-zinc-750 transition-colors"
                >
                  Register Creator
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar controls (Col span 1) */}
          <div className="space-y-6">
            
            {/* Update Drama Index Gauge */}
            <div className="glass-panel p-6 rounded-xl border border-zinc-800 shadow-2xl">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-4">
                🔥 Quick Update Drama Heat
              </h2>
              <form onSubmit={handleUpdateDrama} className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 font-mono block mb-1">Select YouTuber</label>
                  <select
                    value={selectedCreatorId}
                    onChange={(e) => {
                      const cid = e.target.value;
                      setSelectedCreatorId(cid);
                      const target = creators.find(c => c.id === cid);
                      if (target) {
                        setNewDramaMeter(target.dramaMeter);
                        setNewDramaTitle(target.recentDramaTitle || "");
                      }
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-350 focus:border-[#FFD700] outline-none"
                  >
                    <option value="">Choose creator...</option>
                    {creators.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.dramaMeter}%)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-mono block mb-1">Drama Heat index ({newDramaMeter}%)</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={newDramaMeter} 
                    onChange={(e) => setNewDramaMeter(Number(e.target.value))}
                    className="w-full accent-[#FFD700] bg-zinc-900 border border-zinc-800 rounded h-2"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-500 font-mono mt-1">
                    <span>Safe (0)</span>
                    <span>Extreme (100)</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-mono block mb-1">Update Alert Tagline</label>
                  <input 
                    type="text" 
                    value={newDramaTitle} 
                    onChange={(e) => setNewDramaTitle(e.target.value)}
                    placeholder="Leave comment or update message..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-white placeholder-zinc-650 focus:border-[#FFD700] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedCreatorId}
                  className="w-full bg-[#FFD700]/10 border border-[#FFD700]/30 hover:bg-[#FFD700]/20 text-[#FFD700] font-semibold text-xs py-2.5 rounded transition-all disabled:opacity-50"
                >
                  Apply Live Update
                </button>
              </form>
            </div>

            {/* List of articles currently published */}
            <div className="glass-panel p-6 rounded-xl border border-zinc-800">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4">
                📰 Active Publications ({articles.length})
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {articles.map(art => (
                  <div key={art.id} className="border-b border-zinc-900 pb-2 text-xs">
                    <span className="text-[10px] text-[#FFD700] font-mono block">{art.category}</span>
                    <Link href={`/articles/${art.slug}`} className="font-bold text-zinc-300 hover:text-white line-clamp-1 hover:underline">
                      {art.title}
                    </Link>
                    <span className="text-[10px] text-zinc-500 font-mono">{new Date(art.publishedAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Whitelisted Admins List & CRUD */}
            <div className="glass-panel p-6 rounded-xl border border-zinc-800 shadow-2xl">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-4">
                🛡️ Whitelisted Admins ({whitelistEmails.length})
              </h2>
              <form onSubmit={handleAddWhitelistEmail} className="flex gap-2 mb-4">
                <input 
                  type="email" 
                  value={newWhitelistEmail} 
                  onChange={(e) => setNewWhitelistEmail(e.target.value)}
                  placeholder="admin@domain.com"
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-650 focus:border-[#FFD700] outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#FFD700] hover:bg-[#ffe234] text-zinc-950 font-bold text-xs px-3 py-1.5 rounded transition-colors"
                >
                  Whitelist
                </button>
              </form>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {whitelistEmails.map((email) => (
                  <div key={email} className="flex items-center justify-between text-xs border-b border-zinc-900 pb-1.5 font-mono">
                    <span className="truncate max-w-[180px] text-zinc-350">{email}</span>
                    {email !== "mittifiedbusiness@gmail.com" && (
                      <button
                        onClick={() => handleRemoveWhitelistEmail(email)}
                        className="text-red-500 hover:text-red-400 p-1"
                        title="Remove Whitelist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Navigation Links CRUD */}
            <div className="glass-panel p-6 rounded-xl border border-zinc-800 shadow-2xl">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-4">
                <Link2 className="text-[#FFD700] w-4 h-4" /> Header Links CRUD
              </h2>
              <form onSubmit={handleAddNavLink} className="space-y-2.5 mb-4">
                <input 
                  type="text" 
                  value={newNavLinkLabel} 
                  onChange={(e) => setNewNavLinkLabel(e.target.value)}
                  placeholder="Link Label (e.g., Blog)"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-650 focus:border-[#FFD700] outline-none"
                />
                <input 
                  type="text" 
                  value={newNavLinkHref} 
                  onChange={(e) => setNewNavLinkHref(e.target.value)}
                  placeholder="Href Target (e.g., /#blog)"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-650 focus:border-[#FFD700] outline-none"
                />
                <button
                  type="submit"
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs py-1.5 rounded border border-zinc-750 transition-colors"
                >
                  Create Navigation Link
                </button>
              </form>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {navLinksList.map((link, index) => (
                  <div key={link.label + index} className="flex items-center justify-between text-xs border-b border-zinc-900 pb-1.5 font-mono">
                    <div>
                      <span className="font-bold text-zinc-300">{link.label}</span>
                      <span className="text-[10px] text-zinc-500 block">{link.href}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveNavLink(index)}
                      className="text-red-500 hover:text-red-400 p-1"
                      title="Remove Link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Rotating API Keys Setup */}
            <div className="glass-panel p-6 rounded-xl border border-zinc-800 shadow-2xl">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-3">
                <Key className="text-[#FFD700] w-4 h-4" /> Rotating API Keys Pool
              </h2>
              <p className="text-[10px] text-zinc-500 font-sans leading-relaxed mb-3">
                Paste bulk API keys (one key per line) to automatically cycle and avoid single-key quota blocks.
              </p>
              <form onSubmit={handleSaveApiKeys} className="space-y-3">
                <textarea
                  value={apiKeysInput}
                  onChange={(e) => setApiKeysInput(e.target.value)}
                  rows={4}
                  placeholder="AIzaSy...&#10;AIzaSy..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder-zinc-650 focus:border-[#FFD700] outline-none font-mono"
                />
                <button
                  type="submit"
                  className="w-full bg-[#FFD700]/10 border border-[#FFD700]/30 hover:bg-[#FFD700]/20 text-[#FFD700] font-semibold text-xs py-2.5 rounded transition-all"
                >
                  Save & Update Rotation Pool
                </button>
              </form>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
