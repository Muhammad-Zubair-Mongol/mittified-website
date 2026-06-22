"use client";

import { useEffect, useRef } from "react";
import { trackArticleView, updateArticleViewDuration } from "@/lib/db";

interface ArticleTrackerProps {
  articleId: string;
  slug: string;
  category: string;
  title: string;
}

export default function ArticleTracker({ articleId, slug, category, title }: ArticleTrackerProps) {
  const sessionIdRef = useRef<string>("");
  const durationRef = useRef<number>(0);
  const isCompletedRef = useRef<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Generate a unique session ID for this view session
    sessionIdRef.current = "sess-" + Math.random().toString(36).substring(2, 15) + "-" + Date.now();

    // Get or create a persistent visitor ID in localStorage
    let visitorId = "";
    if (typeof window !== "undefined") {
      try {
        visitorId = localStorage.getItem("mittified_visitor_id") || "";
        if (!visitorId) {
          visitorId = "vis-" + Math.random().toString(36).substring(2, 15) + "-" + Date.now();
          localStorage.setItem("mittified_visitor_id", visitorId);
        }
      } catch (e) {
        visitorId = "vis-fallback";
      }
    }

    // Determine device type
    let device = "Desktop";
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      if (width < 768) {
        device = "Mobile";
      } else if (width < 1024) {
        device = "Tablet";
      }
    }

    // Determine referrer
    let referrer = "Direct";
    if (typeof document !== "undefined" && document.referrer) {
      try {
        const refUrl = new URL(document.referrer);
        referrer = refUrl.hostname || "Referral";
      } catch (e) {
        referrer = "Referral";
      }
    }

    // Capture URL parameter overrides (like search queries, external links, social source)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const utmSource = params.get("utm_source");
      const utmMedium = params.get("utm_medium");
      if (utmSource) {
        referrer = utmSource + (utmMedium ? ` / ${utmMedium}` : "");
      }
    }

    // Initialize page track in database
    trackArticleView(
      sessionIdRef.current,
      articleId,
      slug,
      category,
      title,
      visitorId,
      device,
      referrer
    );

    // Track scroll depth
    const handleScroll = () => {
      if (isCompletedRef.current) return; // already completed

      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const scrollY = window.scrollY;

      // Scroll depth completion threshold (85%)
      if (scrollHeight - clientHeight <= 0) {
        isCompletedRef.current = true;
      } else {
        const scrolledPercentage = (scrollY / (scrollHeight - clientHeight)) * 100;
        if (scrolledPercentage >= 85) {
          isCompletedRef.current = true;
          // Send update immediately upon completion
          updateArticleViewDuration(
            sessionIdRef.current,
            durationRef.current,
            true
          );
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once on load in case the page is very short or user is already scrolled down
    handleScroll();

    // Setup active duration tracker heartbeat
    const heartbeatSec = 5;
    intervalRef.current = setInterval(() => {
      // Only count time if the page is currently visible to user
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        durationRef.current += heartbeatSec;
        updateArticleViewDuration(
          sessionIdRef.current,
          durationRef.current,
          isCompletedRef.current
        );
      }
    }, heartbeatSec * 1000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      // Send final state on unmount
      updateArticleViewDuration(
        sessionIdRef.current,
        durationRef.current,
        isCompletedRef.current
      );
    };
  }, [articleId, slug, category, title]);

  return null; // visual-less tracker
}
