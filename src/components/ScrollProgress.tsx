"use client";

import React, { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        // Map scroll progress to a value between 0 and 100
        const currentProgress = Math.min((window.scrollY / totalScroll) * 100, 100);
        setProgress(currentProgress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once initially to capture page height calculations
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div 
      className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-[#FFD700] via-[#fff066] to-[#FFD700] z-50 origin-left will-change-transform transition-transform duration-100 ease-out"
      style={{ transform: `scaleX(${progress / 100})`, width: "100%" }}
      aria-hidden="true"
    />
  );
}
