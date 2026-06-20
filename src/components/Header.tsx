"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, ShieldAlert, TrendingUp, Menu, X, PlusCircle, LogOut } from "lucide-react";
import { auth, verifyAdminWhitelist, getNavLinksFb, NavLink } from "@/lib/firebase";
import { signOut } from "firebase/auth";

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.52 3.545 12 3.545 12 3.545s-7.52 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.868.507 9.388.507 9.388.507s7.52 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

interface HeaderProps {
  totalSubscribers: number;
  exposedCount: number;
}

export default function Header({ totalSubscribers, exposedCount }: HeaderProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);

  useEffect(() => {
    async function loadLinks() {
      const links = await getNavLinksFb();
      setNavLinks(links);
    }
    loadLinks();
  }, []);

  const tickerItems = [
    "URGENT: Raza Samo drops 20-min tell-all podcast response.",
    "MILESTONE: Ducky Bhai officially crosses 8.4M subscribers.",
    "ALGORITHM WATCH: Cinematic vlogs face record low recommendation rates.",
    "TRENDING: #PakistaniYouTubeDrama tags dominate Twitter trends."
  ];

  useEffect(() => {
    if (auth) {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          const isWhitelisted = await verifyAdminWhitelist(user.email);
          setIsAdmin(isWhitelisted);
        } else {
          setIsAdmin(false);
        }
      });
      return () => unsubscribe();
    } else {
      // Simulate local login fallback
      const session = localStorage.getItem("mittified_session");
      if (session) {
        const userObj = JSON.parse(session);
        verifyAdminWhitelist(userObj.user?.email).then(setIsAdmin);
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
    } else {
      // Simulate logout
      localStorage.removeItem("mittified_session");
      setIsAdmin(false);
      window.location.reload();
    }
  };

  return (
    <header className="w-full sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      {/* Real-time Ticker Bar */}
      <div className="w-full bg-black py-2 px-4 border-b border-zinc-900 flex items-center justify-between text-xs text-zinc-400 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="bg-red-600 text-white font-black px-1.5 py-0.5 rounded text-[10px] tracking-wider uppercase animate-pulse flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 fill-current" /> Live Drama Tracker
          </span>
          <div className="transition-all duration-500 ease-in-out">
            {tickerItems[tickerIndex]}
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[11px] font-mono text-zinc-500">
          <span className="flex items-center gap-1">
            <YoutubeIcon className="w-3.5 h-3.5 text-red-500" /> Tracking {(totalSubscribers / 1000000).toFixed(1)}M Sub Pool
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
          <span className="flex items-center gap-1 text-amber-500">
            <ShieldAlert className="w-3.5 h-3.5" /> {exposedCount} Creators Flagged
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="/logo.jpg" 
              alt="Mittified Logo" 
              className="w-8 h-8 rounded-full border border-[#FFD700]/30 object-cover" 
            />
            <span className="text-2xl font-black tracking-tighter text-white">
              MITTI<span className="text-primary text-[#FFD700]">FIED</span>
            </span>
            <span className="text-[10px] font-mono border border-[#FFD700]/30 text-[#FFD700] px-1.5 py-0.2 rounded uppercase">
              Media Hub
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className="hover:text-[#FFD700] transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {isAdmin ? (
            <>
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FFD700] hover:bg-[#ffe234] text-black font-semibold text-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Admin Console
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors"
              >
                <LogOut className="w-4 h-4" /> Log Out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold rounded-md border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
            >
              Sign In (Admin)
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-zinc-400 hover:text-white p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-t border-zinc-800 px-4 pt-2 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-zinc-300 hover:text-white hover:bg-zinc-900"
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-zinc-800 pt-2 mt-2">
            {isAdmin ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-md bg-[#FFD700] text-black font-semibold text-sm"
                >
                  Admin Console
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-md bg-zinc-800 text-white font-medium text-sm"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 rounded-md border border-zinc-800 text-zinc-300 font-semibold text-sm hover:bg-zinc-900"
              >
                Sign In (Admin)
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
