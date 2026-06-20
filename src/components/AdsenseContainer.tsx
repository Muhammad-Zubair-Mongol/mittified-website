"use client";

import React, { useEffect, useState } from "react";

interface AdsenseContainerProps {
  placement: "header" | "in-feed" | "footer";
  publisherId?: string;
  adSlot?: string;
}

export default function AdsenseContainer({
  placement,
  publisherId = "ca-pub-0000000000000000",
  adSlot = "0000000000"
}: AdsenseContainerProps) {
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // Simulate AdSense script load safely
    const timer = setTimeout(() => {
      setAdLoaded(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const styles = {
    header: {
      wrapper: "ad-header-spacer w-full rounded-lg overflow-hidden relative border border-zinc-800 bg-zinc-950 flex items-center justify-center my-6",
      dimensions: "w-full max-w-[728px] h-[90px] flex items-center justify-center"
    },
    "in-feed": {
      wrapper: "ad-sidebar-spacer w-full max-w-[300px] h-[250px] mx-auto rounded-lg overflow-hidden relative border border-zinc-800 bg-zinc-950 flex items-center justify-center my-4",
      dimensions: "w-[300px] h-[250px] flex items-center justify-center"
    },
    footer: {
      wrapper: "w-full min-h-[100px] max-h-[120px] rounded-lg overflow-hidden relative border border-zinc-800 bg-zinc-950 flex items-center justify-center my-8",
      dimensions: "w-full h-full flex items-center justify-center"
    }
  };

  const current = styles[placement];

  return (
    <div className={current.wrapper}>
      {/* Anchor Ad Restraints and explicit dimensions prevents page jumps */}
      <div className={`${current.dimensions} transition-all duration-300`}>
        {!adLoaded ? (
          <div className="text-[10px] text-zinc-600 uppercase tracking-widest animate-pulse font-mono">
            Advertisement Space Reserved
          </div>
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-zinc-900/50 p-2">
            <span className="absolute top-1 right-2 text-[9px] text-zinc-500 font-mono">ADVERTISEMENT</span>
            <div className="text-center">
              <p className="text-xs text-zinc-400 font-semibold">Promotional Campaign Spot</p>
              <p className="text-[10px] text-zinc-500 mt-1 font-mono">Slot ID: {adSlot}</p>
            </div>
            {/* Real AdSense tag in production:
            <ins className="adsbygoogle"
                 style={{ display: "block" }}
                 data-ad-client={publisherId}
                 data-ad-slot={adSlot}
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            */}
          </div>
        )}
      </div>
    </div>
  );
}
