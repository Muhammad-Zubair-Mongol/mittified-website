"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  getCreators, 
  getArticles, 
  getWhitelistedAdmins,
  addWhitelistedAdmin,
  removeWhitelistedAdmin,
  getNavLinks,
  saveNavLinks,
  getRotatingKeys,
  saveRotatingKeys,
  getTickerItems,
  saveTickerItems,
  deleteArticle,
  deleteCreator,
  getSelectedModel,
  saveSelectedModel,
  getCreatorCategories,
  saveCreatorCategories,
  getArticleCategories,
  saveArticleCategories,
  auth,
  verifyAdminWhitelist,
  NavLink
} from "@/lib/db";
import { signOut } from "firebase/auth";
import { Creator, Article } from "@/lib/mockData";
import { ShieldCheck, LogOut, Key, Link2, Trash2, Flame } from "lucide-react";
import Link from "next/link";
import ArticlePublisher from "@/components/admin/ArticlePublisher";
import AddCreatorForm from "@/components/admin/AddCreatorForm";
import CreatorEditor from "@/components/admin/CreatorEditor";
import ArticleEditor from "@/components/admin/ArticleEditor";

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Lists
  const [creators, setCreators] = useState<Creator[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  // Whitelist admin states
  const [whitelistEmails, setWhitelistEmails] = useState<string[]>([]);

  // Navigation link states
  const [navLinksList, setNavLinksList] = useState<NavLink[]>([]);

  // Rotating keys states
  const [apiKeysInput, setApiKeysInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");

  // Live Drama Tracker ticker items states
  const [tickerItemsList, setTickerItemsList] = useState<string[]>([]);

  // Dynamic creator categories state
  const [creatorCategories, setCreatorCategories] = useState<string[]>([]);

  // Dynamic article categories state
  const [articleCategories, setArticleCategories] = useState<string[]>([]);

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

    const ticker = await getTickerItems();
    setTickerItemsList(ticker);

    const model = await getSelectedModel();
    setSelectedModel(model);

    const cats = await getCreatorCategories();
    setCreatorCategories(cats);

    const aCats = await getArticleCategories();
    setArticleCategories(aCats);
  }

  const handleSaveCreatorCategories = async (updated: string[]) => {
    const success = await saveCreatorCategories(updated);
    if (success) {
      setCreatorCategories(updated);
      return true;
    }
    return false;
  };

  const handleSaveArticleCategories = async (updated: string[]) => {
    const success = await saveArticleCategories(updated);
    if (success) {
      setArticleCategories(updated);
      return true;
    }
    return false;
  };

  const handleAddWhitelistEmail = async (email: string) => {
    if (!email.trim()) return false;
    const success = await addWhitelistedAdmin(email);
    if (success) {
      setWhitelistEmails(prev => [...prev, email.toLowerCase().trim()]);
      alert("Admin email whitelisted successfully!");
      return true;
    }
    return false;
  };

  const handleRemoveWhitelistEmail = async (email: string) => {
    if (email.toLowerCase() === "mittifiedbusiness@gmail.com") {
      alert("Cannot remove the master bypass administrator email.");
      return false;
    }
    const success = await removeWhitelistedAdmin(email);
    if (success) {
      setWhitelistEmails(prev => prev.filter(e => e !== email));
      alert("Admin email removed from whitelist.");
      return true;
    }
    return false;
  };

  const handleSaveNavLinksList = async (updated: NavLink[]) => {
    const success = await saveNavLinks(updated);
    if (success) {
      setNavLinksList(updated);
      return true;
    }
    return false;
  };

  const handleSaveTickerItemsList = async (updated: string[]) => {
    const success = await saveTickerItems(updated);
    if (success) {
      setTickerItemsList(updated);
      return true;
    }
    return false;
  };

  const triggerRevalidation = async (additionalPaths: string[] = []) => {
    try {
      await fetch("/api/revalidate?path=/");
      await fetch("/api/revalidate?path=/creators");
      await fetch("/api/revalidate?path=/feed.xml");
      await fetch("/api/revalidate?path=/llms.txt");
      for (const path of additionalPaths) {
        await fetch(`/api/revalidate?path=${path}`);
      }
    } catch (e) {
      console.error("Revalidation failed:", e);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("Are you sure you want to delete this publication?")) return;
    const art = articles.find(a => a.id === id);
    const success = await deleteArticle(id);
    if (success) {
      setArticles(prev => prev.filter(art => art.id !== id));
      alert("Publication deleted successfully!");
      const paths = art ? [`/articles/${art.slug}`] : [];
      if (art?.creatorId) paths.push(`/creators/${art.creatorId}`);
      triggerRevalidation(paths);
    } else {
      alert("Failed to delete publication.");
    }
  };

  const handleDeleteCreator = async (id: string) => {
    if (!confirm("Are you sure you want to delete this creator?")) return;
    const success = await deleteCreator(id);
    if (success) {
      setCreators(prev => prev.filter(c => c.id !== id));
      alert("Creator deleted successfully!");
      const linkedArticles = articles.filter(a => a.creatorId === id);
      const paths = [`/creators/${id}`];
      linkedArticles.forEach(a => paths.push(`/articles/${a.slug}`));
      triggerRevalidation(paths);
    } else {
      alert("Failed to delete creator.");
    }
  };

  const handleSaveSelectedModel = async (model: string) => {
    setSelectedModel(model);
    await saveSelectedModel(model);
    triggerRevalidation();
  };

  const handleSaveApiKeys = async (keys: string[]) => {
    const success = await saveRotatingKeys(keys);
    if (success) {
      setApiKeysInput(keys.join("\n"));
      triggerRevalidation();
      return true;
    }
    return false;
  };

  const handleArticlePublished = (newArt: Article) => {
    setArticles(prev => [newArt, ...prev]);
    const paths = [`/articles/${newArt.slug}`];
    if (newArt.creatorId) paths.push(`/creators/${newArt.creatorId}`);
    triggerRevalidation(paths);
  };

  const handleCreatorAdded = (newC: Creator) => {
    setCreators(prev => [...prev, newC]);
    triggerRevalidation([`/creators/${newC.id}`]);
  };

  const handleCreatorUpdated = (updated: Creator) => {
    setCreators(prev => prev.map(c => c.id === updated.id ? updated : c));
    triggerRevalidation([`/creators/${updated.id}`]);
  };

  const handleArticleUpdated = (updated: Article) => {
    setArticles(prev => prev.map(a => a.id === updated.id ? updated : a));
    triggerRevalidation([`/articles/${updated.slug}`]);
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-all duration-200 hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
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
            <ArticlePublisher 
              creators={creators} 
              selectedModel={selectedModel} 
              categories={articleCategories}
              onArticlePublished={handleArticlePublished} 
            />

            {/* Form: Add Creator */}
            <AddCreatorForm 
              categories={creatorCategories}
              onCreatorAdded={handleCreatorAdded} 
            />
          </div>

          {/* Sidebar controls (Col span 1) */}
          <div className="space-y-6">
            
            {/* Update Creator Profiles */}
            <CreatorEditor 
              creators={creators} 
              categories={creatorCategories}
              onCreatorUpdated={handleCreatorUpdated} 
            />

            {/* Update Article Profiles */}
            <ArticleEditor 
              articles={articles}
              categories={articleCategories}
              onArticleUpdated={handleArticleUpdated}
            />

            {/* List of articles currently published */}
            <div className="glass-panel p-6 rounded-xl border border-zinc-800">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4">
                📰 Active Publications ({articles.length})
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {articles.map(art => (
                  <div key={art.id} className="virtual-list-item border-b border-zinc-900 pb-2 text-xs flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-[#FFD700] font-mono block">{art.category}</span>
                      <Link href={`/articles/${art.slug}`} className="font-bold text-zinc-300 hover:text-white line-clamp-1 hover:underline">
                        {art.title}
                      </Link>
                      <span className="text-[10px] text-zinc-500 font-mono">{new Date(art.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteArticle(art.id)}
                      className="text-red-500 hover:text-red-400 p-1 flex-shrink-0 transition-all duration-200 hover:scale-115 active:scale-90"
                      title="Delete Publication"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* List of registered creators */}
            <div className="glass-panel p-6 rounded-xl border border-zinc-800">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono mb-4">
                👥 Tracked Creators ({creators.length})
              </h2>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {creators.map(c => (
                  <div key={c.id} className="virtual-list-item border-b border-zinc-900 pb-2 text-xs flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-zinc-300 block truncate">{c.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono block truncate">{c.handle}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteCreator(c.id)}
                      className="text-red-500 hover:text-red-450 p-1 flex-shrink-0 transition-all duration-200 hover:scale-115 active:scale-90"
                      title="Delete Creator"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Whitelisted Admins List & CRUD */}
            <WhitelistedAdmins 
              whitelistEmails={whitelistEmails} 
              onAddEmail={handleAddWhitelistEmail} 
              onRemoveEmail={handleRemoveWhitelistEmail} 
            />

            {/* Creator Categories List & CRUD */}
            <ManageCreatorCategories 
              categories={creatorCategories}
              onSaveCategories={handleSaveCreatorCategories}
            />

            {/* Article Categories List & CRUD */}
            <ManageArticleCategories 
              categories={articleCategories}
              onSaveCategories={handleSaveArticleCategories}
            />

            {/* Dynamic Navigation Links CRUD */}
            <HeaderLinksCrud 
              navLinksList={navLinksList} 
              onSaveLinks={handleSaveNavLinksList} 
            />

            {/* Live Drama Tracker Ticker CRUD */}
            <LiveDramaTrackerTicker 
              tickerItemsList={tickerItemsList} 
              onSaveItems={handleSaveTickerItemsList} 
            />

            {/* Rotating API Keys Setup */}
            <RotatingApiKeys 
              initialKeys={apiKeysInput} 
              selectedModel={selectedModel} 
              onSaveKeys={handleSaveApiKeys} 
              onModelChange={handleSaveSelectedModel} 
            />

          </div>

        </div>

      </main>
    </div>
  );
}

interface WhitelistedAdminsProps {
  whitelistEmails: string[];
  onAddEmail: (email: string) => Promise<boolean>;
  onRemoveEmail: (email: string) => Promise<boolean>;
}

function WhitelistedAdmins({ whitelistEmails, onAddEmail, onRemoveEmail }: WhitelistedAdminsProps) {
  const [newWhitelistEmail, setNewWhitelistEmail] = useState("");

  const handleAddWhitelistEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWhitelistEmail.trim()) return;
    const success = await onAddEmail(newWhitelistEmail);
    if (success) {
      setNewWhitelistEmail("");
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-zinc-800 shadow-2xl">
      <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-4">
        🛡️ Whitelisted Admins ({whitelistEmails.length})
      </h2>
      <form onSubmit={handleAddWhitelistEmailSubmit} className="flex gap-2 mb-4">
        <label htmlFor="whitelist-email-input" className="sr-only">Admin email to whitelist</label>
        <input 
          id="whitelist-email-input"
          type="email" 
          value={newWhitelistEmail} 
          onChange={(e) => setNewWhitelistEmail(e.target.value)}
          placeholder="admin@domain.com"
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-650 focus:border-[#FFD700] outline-none"
        />
        <button
          type="submit"
          className="bg-[#FFD700] hover:bg-[#ffe234] text-zinc-950 font-bold text-xs px-3 py-1.5 rounded transition-all duration-200 hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
        >
          Whitelist
        </button>
      </form>
      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {whitelistEmails.map((email) => (
          <div key={email} className="virtual-list-item flex items-center justify-between text-xs border-b border-zinc-900 pb-1.5 font-mono">
            <span className="truncate max-w-[180px] text-zinc-350">{email}</span>
            {email !== "mittifiedbusiness@gmail.com" && (
              <button
                onClick={() => onRemoveEmail(email)}
                className="text-red-500 hover:text-red-450 p-1 transition-all duration-200 hover:scale-115 active:scale-90"
                title="Remove Whitelist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface HeaderLinksCrudProps {
  navLinksList: NavLink[];
  onSaveLinks: (links: NavLink[]) => Promise<boolean>;
}

function HeaderLinksCrud({ navLinksList, onSaveLinks }: HeaderLinksCrudProps) {
  const [newNavLinkLabel, setNewNavLinkLabel] = useState("");
  const [newNavLinkHref, setNewNavLinkHref] = useState("");

  const handleAddNavLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNavLinkLabel.trim() || !newNavLinkHref.trim()) return;
    const updated = [...navLinksList, { label: newNavLinkLabel, href: newNavLinkHref }];
    const success = await onSaveLinks(updated);
    if (success) {
      setNewNavLinkLabel("");
      setNewNavLinkHref("");
      alert("Navigation link added!");
    }
  };

  const handleRemoveNavLink = async (index: number) => {
    const updated = navLinksList.filter((_, i) => i !== index);
    const success = await onSaveLinks(updated);
    if (success) {
      alert("Navigation link removed!");
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-zinc-800 shadow-2xl">
      <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-4">
        <Link2 className="text-[#FFD700] w-4 h-4" /> Header Links CRUD
      </h2>
      <form onSubmit={handleAddNavLinkSubmit} className="space-y-2.5 mb-4">
        <label htmlFor="nav-link-label" className="sr-only">Link Label</label>
        <input 
          id="nav-link-label"
          type="text" 
          value={newNavLinkLabel} 
          onChange={(e) => setNewNavLinkLabel(e.target.value)}
          placeholder="Link Label (e.g., Blog)"
          className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-650 focus:border-[#FFD700] outline-none"
        />
        <label htmlFor="nav-link-href" className="sr-only">Link Href</label>
        <input 
          id="nav-link-href"
          type="text" 
          value={newNavLinkHref} 
          onChange={(e) => setNewNavLinkHref(e.target.value)}
          placeholder="Href Target (e.g., /#blog)"
          className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-650 focus:border-[#FFD700] outline-none"
        />
        <button
          type="submit"
          className="w-full bg-zinc-800 hover:bg-zinc-750 text-white font-bold text-xs py-1.5 rounded border border-zinc-750 transition-all duration-200 hover:-translate-y-0.5 active:scale-98 active:translate-y-0"
        >
          Create Navigation Link
        </button>
      </form>
      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {navLinksList.map((link, index) => (
          <div key={link.label + index} className="virtual-list-item flex items-center justify-between text-xs border-b border-zinc-900 pb-1.5 font-mono">
            <div>
              <span className="font-bold text-zinc-300">{link.label}</span>
              <span className="text-[10px] text-zinc-500 block">{link.href}</span>
            </div>
            <button
              onClick={() => handleRemoveNavLink(index)}
              className="text-red-500 hover:text-red-450 p-1 transition-all duration-200 hover:scale-115 active:scale-90"
              title="Remove Link"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LiveDramaTrackerTickerProps {
  tickerItemsList: string[];
  onSaveItems: (items: string[]) => Promise<boolean>;
}

function LiveDramaTrackerTicker({ tickerItemsList, onSaveItems }: LiveDramaTrackerTickerProps) {
  const [newTickerItem, setNewTickerItem] = useState("");

  const handleAddTickerItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTickerItem.trim()) return;
    const updated = [...tickerItemsList, newTickerItem.trim()];
    const success = await onSaveItems(updated);
    if (success) {
      setNewTickerItem("");
      alert("Drama alert added to ticker!");
    }
  };

  const handleRemoveTickerItem = async (index: number) => {
    const updated = tickerItemsList.filter((_, i) => i !== index);
    const success = await onSaveItems(updated);
    if (success) {
      alert("Drama alert removed!");
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-zinc-800 shadow-2xl">
      <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-4">
        <Flame className="text-[#FFD700] w-4 h-4 text-rose-500 animate-pulse" /> Live Drama Tracker CRUD
      </h2>
      <form onSubmit={handleAddTickerItemSubmit} className="space-y-2.5 mb-4">
        <label htmlFor="ticker-item-input" className="sr-only">Ticker Item Text</label>
        <input 
          id="ticker-item-input"
          type="text" 
          value={newTickerItem} 
          onChange={(e) => setNewTickerItem(e.target.value)}
          placeholder="Ticker Item Text (e.g., URGENT: Ducky Bhai...)"
          className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-650 focus:border-[#FFD700] outline-none"
        />
        <button
          type="submit"
          className="w-full bg-zinc-800 hover:bg-zinc-750 text-white font-bold text-xs py-1.5 rounded border border-zinc-750 transition-all duration-200 hover:-translate-y-0.5 active:scale-98 active:translate-y-0"
        >
          Add Ticker Alert
        </button>
      </form>
      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {tickerItemsList.map((item, index) => (
          <div key={item + index} className="virtual-list-item flex items-start justify-between text-xs border-b border-zinc-900 pb-1.5 font-mono">
            <span className="text-zinc-300 leading-normal pr-2">{item}</span>
            <button
              onClick={() => handleRemoveTickerItem(index)}
              className="text-red-500 hover:text-red-450 p-1 flex-shrink-0 transition-all duration-200 hover:scale-115 active:scale-90"
              title="Remove Ticker Alert"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface RotatingApiKeysProps {
  initialKeys: string;
  selectedModel: string;
  onSaveKeys: (keys: string[]) => Promise<boolean>;
  onModelChange: (model: string) => void;
}

function RotatingApiKeys({ initialKeys, selectedModel, onSaveKeys, onModelChange }: RotatingApiKeysProps) {
  const [apiKeysInput, setApiKeysInput] = useState(initialKeys);

  useEffect(() => {
    setApiKeysInput(initialKeys);
  }, [initialKeys]);

  const handleSaveApiKeysSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const keysArray = apiKeysInput.split("\n").map(k => k.trim()).filter(Boolean);
    const success = await onSaveKeys(keysArray);
    if (success) {
      alert("Rotating API keys updated successfully!");
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-zinc-800 shadow-2xl">
      <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-3">
        <Key className="text-[#FFD700] w-4 h-4" /> Rotating API Keys Pool
      </h2>
      <p className="text-[10px] text-zinc-500 font-sans leading-relaxed mb-3">
        Paste bulk API keys (one key per line) to automatically cycle and avoid single-key quota blocks.
      </p>

      <div className="mb-4">
        <label htmlFor="gemini-model-select" className="text-[10px] text-zinc-400 font-mono block mb-1">Gemini Model for AI Generation</label>
        <input
          id="gemini-model-select"
          type="text"
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          placeholder="e.g. gemini-2.5-flash"
          list="gemini-models"
          className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-300 focus:border-[#FFD700] outline-none"
        />
        <datalist id="gemini-models">
          <option value="gemini-2.5-flash" />
          <option value="gemini-2.5-pro" />
          <option value="gemini-1.5-flash" />
          <option value="gemini-1.5-pro" />
        </datalist>
        <p className="text-[9px] text-zinc-550 font-mono mt-1">
          Type any custom/future model name (e.g., custom fine-tuned models).
        </p>
      </div>

      <form onSubmit={handleSaveApiKeysSubmit} className="space-y-3">
        <div>
          <label htmlFor="api-key-pool-textarea" className="text-[10px] text-zinc-400 font-mono block mb-1">API Key Pool</label>
          <textarea
            id="api-key-pool-textarea"
            value={apiKeysInput}
            onChange={(e) => setApiKeysInput(e.target.value)}
            rows={4}
            placeholder="AIzaSy...&#10;AIzaSy..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder-zinc-650 focus:border-[#FFD700] outline-none font-mono"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#FFD700]/10 border border-[#FFD700]/30 hover:bg-[#FFD700]/20 text-[#FFD700] font-semibold text-xs py-2.5 rounded transition-all duration-200 hover:-translate-y-0.5 active:scale-98 active:translate-y-0"
        >
          Save & Update Rotation Pool
        </button>
      </form>
    </div>
  );
}

interface ManageCreatorCategoriesProps {
  categories: string[];
  onSaveCategories: (categories: string[]) => Promise<boolean>;
}

function ManageCreatorCategories({ categories, onSaveCategories }: ManageCreatorCategoriesProps) {
  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCategory.trim();
    if (!clean) return;
    if (categories.includes(clean)) {
      alert("Category already exists.");
      return;
    }
    const updated = [...categories, clean];
    const success = await onSaveCategories(updated);
    if (success) {
      setNewCategory("");
      alert("Category added successfully!");
    }
  };

  const handleRemoveCategory = async (cat: string) => {
    if (!confirm(`Are you sure you want to remove the category "${cat}"? YouTubers currently using this category will keep it, but it will be removed from future selection options.`)) return;
    const updated = categories.filter(c => c !== cat);
    const success = await onSaveCategories(updated);
    if (success) {
      alert("Category removed!");
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-zinc-800 shadow-2xl">
      <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-4">
        📁 Creator Categories CRUD
      </h2>
      <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
        <label htmlFor="new-category-input" className="sr-only">New Category Name</label>
        <input 
          id="new-category-input"
          type="text" 
          value={newCategory} 
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New Category (e.g. Gamer)"
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-650 focus:border-[#FFD700] outline-none"
        />
        <button
          type="submit"
          className="bg-[#FFD700] hover:bg-[#ffe234] text-zinc-950 font-bold text-xs px-3 py-1.5 rounded transition-all duration-200 hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
        >
          Add
        </button>
      </form>
      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {categories.map((cat) => (
          <div key={cat} className="virtual-list-item flex items-center justify-between text-xs border-b border-zinc-900 pb-1.5 font-mono">
            <span className="text-zinc-350">{cat}</span>
            <button
              onClick={() => handleRemoveCategory(cat)}
              className="text-red-500 hover:text-red-450 p-1 transition-all duration-200 hover:scale-115 active:scale-90"
              title="Remove Category"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ManageArticleCategoriesProps {
  categories: string[];
  onSaveCategories: (categories: string[]) => Promise<boolean>;
}

function ManageArticleCategories({ categories, onSaveCategories }: ManageArticleCategoriesProps) {
  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCategory.trim();
    if (!clean) return;
    if (categories.includes(clean)) {
      alert("Category already exists.");
      return;
    }
    const updated = [...categories, clean];
    const success = await onSaveCategories(updated);
    if (success) {
      setNewCategory("");
      alert("Category added successfully!");
    }
  };

  const handleRemoveCategory = async (cat: string) => {
    if (!confirm(`Are you sure you want to remove the category "${cat}"? Articles currently published under this category will keep it, but it will be removed from future selection options.`)) return;
    const updated = categories.filter(c => c !== cat);
    const success = await onSaveCategories(updated);
    if (success) {
      alert("Category removed!");
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-zinc-800 shadow-2xl">
      <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mb-4">
        📁 Article Categories CRUD
      </h2>
      <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
        <label htmlFor="new-article-category-input" className="sr-only">New Category Name</label>
        <input 
          id="new-article-category-input"
          type="text" 
          value={newCategory} 
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New Category (e.g. Exposé)"
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-650 focus:border-[#FFD700] outline-none"
        />
        <button
          type="submit"
          className="bg-[#FFD700] hover:bg-[#ffe234] text-zinc-950 font-bold text-xs px-3 py-1.5 rounded transition-all duration-200 hover:-translate-y-0.5 active:scale-95 active:translate-y-0"
        >
          Add
        </button>
      </form>
      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {categories.map((cat) => (
          <div key={cat} className="virtual-list-item flex items-center justify-between text-xs border-b border-zinc-900 pb-1.5 font-mono">
            <span className="text-zinc-350">{cat}</span>
            <button
              onClick={() => handleRemoveCategory(cat)}
              className="text-red-500 hover:text-red-450 p-1 transition-all duration-200 hover:scale-115 active:scale-90"
              title="Remove Category"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


