import React from "react";
import Link from "next/link";
import AdsenseContainer from "@/components/AdsenseContainer";

const YouTubeIcon = () => (
  <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.52 3.545 12 3.545 12 3.545s-7.52 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.868.507 9.388.507 9.388.507s7.52 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const ThreadsIcon = () => (
  <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.36 12.3c-.29.56-.73.99-1.32 1.3-.59.3-1.29.45-2.09.45-.63 0-1.22-.11-1.76-.32s-1.01-.52-1.41-.93c-.4-.41-.72-.9-.95-1.48s-.35-1.23-.35-1.95c0-.74.12-1.41.35-2s.56-1.07.96-1.47.88-.71 1.43-.92c.55-.21 1.15-.32 1.8-.32.61 0 1.17.1 1.67.31s.92.51 1.27.91c.35.4.61.88.78 1.44s.25 1.18.25 1.87v.64c0 .48-.06.91-.18 1.3s-.29.72-.51.99c-.22.27-.49.48-.8.63s-.66.22-1.05.22c-.3 0-.58-.06-.82-.17s-.45-.27-.61-.47c-.16-.2-.27-.44-.33-.71s-.09-.56-.09-.87c-.31.32-.67.57-1.08.75s-.86.27-1.35.27c-.49 0-.93-.09-1.32-.26s-.73-.42-1.01-.73c-.28-.31-.5-.69-.64-1.12s-.22-.92-.22-1.47c0-.57.08-1.09.25-1.57s.41-.9.73-1.26c.32-.36.71-.64 1.17-.84s.99-.3 1.59-.3c.42 0 .8.06 1.15.17s.65.27.9.48c.25.21.44.47.57.77s.21.64.24 1.02h1.22c-.02-.55-.13-1.03-.33-1.44s-.47-.76-.81-1.04c-.34-.28-.75-.49-1.23-.62s-1.02-.2-1.63-.2c-.88 0-1.68.16-2.4.47s-1.33.74-1.83 1.28c-.5.54-.88 1.19-1.14 1.95s-.39 1.6-.39 2.53c0 .88.13 1.66.38 2.35s.61 1.26 1.08 1.72c.47.46 1.04.81 1.71 1.05s1.42.36 2.25.36c.99 0 1.86-.2 2.59-.6s1.31-.96 1.74-1.68l-1.04-.66zm-3.36-1.54c.26 0 .49-.05.69-.15s.37-.24.5-.42.23-.4.29-.66c.06-.26.09-.54.09-.85v-.42c-.02-.37-.09-.7-.21-.99s-.29-.53-.51-.72-.48-.34-.78-.45c-.3-.11-.63-.16-.99-.16-.39 0-.74.07-1.05.21s-.58.33-.8.58c-.22.25-.39.54-.5.88s-.17.7-.17 1.09c0 .36.05.69.15.99s.25.56.45.78c.2.22.45.39.75.51s.64.18 1.04.18z"/></svg>
);

const TikTokIcon = () => (
  <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.99-1.72-.08-.07-.17-.14-.24-.21V14c0 1.92-.5 3.88-1.55 5.5-1.47 2.28-4.02 3.83-6.75 4.1-2.73.27-5.59-.44-7.72-2.19C.28 19.8-1.03 16.97-.93 14c-.08-2.92 1.2-5.78 3.39-7.71 2.05-1.8 4.8-2.6 7.51-2.31V8.1c-1.4-.23-2.88.08-3.99.98-1.12.91-1.78 2.3-1.79 3.75-.02 1.45.62 2.86 1.71 3.8 1.1 1 2.6 1.4 4.09 1.16 1.48-.25 2.76-1.28 3.32-2.68.32-.78.41-1.63.4-2.47V.02z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function Footer() {
  const socials = [
    {
      name: "YouTube",
      url: "https://www.youtube.com/mittified786",
      icon: <YouTubeIcon />,
      color: "hover:text-[#FF0000]"
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com/mittified/",
      icon: <InstagramIcon />,
      color: "hover:text-[#E1306C]"
    },
    {
      name: "Threads",
      url: "https://www.threads.com/@mittified",
      icon: <ThreadsIcon />,
      color: "hover:text-[#FFFFFF]"
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@mittifiedurdu",
      icon: <TikTokIcon />,
      color: "hover:text-[#00f2fe]"
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/profile.php?id=61574705407237",
      icon: <FacebookIcon />,
      color: "hover:text-[#1877F2]"
    }
  ];

  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-950 py-12 text-zinc-500 text-xs font-mono mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Footer Ad Placement */}
        <AdsenseContainer placement="footer" adSlot="11223344" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-left mt-8">
          <div className="md:col-span-2">
            <span className="text-lg font-black text-white block mb-2">MITTIFIED MEDIA</span>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm font-sans mb-6">
              The premier independent news source tracking the Pakistani YouTube ecosystem. Uncovering drama, tracking statistics, and archiving creators.
            </p>
            
            {/* Social Icons Strip */}
            <div className="flex items-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${social.name} page`}
                  className={`group p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 ${social.color} hover:border-[#FFD700]/30 transition-all duration-300`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <span className="text-white font-bold block mb-2 uppercase">Platform</span>
            <ul className="space-y-1.5">
              <li><Link href="/" className="hover:text-[#FFD700] transition-colors">Home</Link></li>
              <li><Link href="/creators" className="hover:text-[#FFD700] transition-colors">Creator Database</Link></li>
              <li><Link href="/feed.xml" className="hover:text-[#FFD700] transition-colors">RSS Feed</Link></li>
              <li><Link href="/sitemap.xml" className="hover:text-[#FFD700] transition-colors">Sitemap</Link></li>
            </ul>
          </div>
          
          <div>
            <span className="text-white font-bold block mb-2 uppercase">Legal</span>
            <ul className="space-y-1.5">
              <li><Link href="/ads.txt" className="hover:text-[#FFD700] transition-colors">Ads.txt</Link></li>
              <li><Link href="/privacy" className="hover:text-[#FFD700] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#FFD700] transition-colors">Terms of Use</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-900 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} Mittified Media Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
