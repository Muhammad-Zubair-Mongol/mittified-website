"use client";

import React, { useState, useEffect } from "react";
import { subscribeToAlerts } from "@/lib/db";
import { Shield, Check, Send } from "lucide-react";

export default function AlertSubscription() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    // Check if user is already subscribed (saved in localStorage)
    if (typeof window !== "undefined") {
      try {
        const list = JSON.parse(localStorage.getItem("mittified_alerts_subscribers_fb") || "[]");
        if (list.length > 0) {
          // just assume subscribed for UI simplicity if any exists
          setSubscribed(true);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleOpenForm = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(true);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.trim();
    if (!clean) return;

    setLoading(true);
    try {
      const success = await subscribeToAlerts(clean);
      if (success) {
        setSubscribed(true);
        setIsOpen(false);
      } else {
        alert("Failed to subscribe. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during subscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center shrink-0">
      {subscribed ? (
        <div className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-xs uppercase tracking-wider shadow-lg">
          <Check className="w-4 h-4" /> Subscribed to Alerts
        </div>
      ) : isOpen ? (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-2 w-full max-w-sm">
          <div className="relative flex-1">
            <label htmlFor="alerts-email-input" className="sr-only">Email address for creator alerts</label>
            <input
              id="alerts-email-input"
              type="email"
              required
              disabled={loading}
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-full bg-zinc-950 border border-zinc-800 focus:border-[#FFD700]/70 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-550 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !email}
              className="px-4 py-2 bg-[#FFD700] hover:bg-[#ffe234] disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1 cursor-pointer transition-all duration-200"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Confirm
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold uppercase tracking-wider rounded-lg cursor-pointer transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={handleOpenForm}
          className="px-5 py-2.5 rounded-lg bg-[#FFD700] hover:bg-[#ffe234] text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#FFD700]/10 hover:shadow-[#FFD700]/20 transition-all duration-200 cursor-pointer flex items-center gap-1.5"
        >
          <Shield className="w-4 h-4" /> Subscribe to Alerts
        </button>
      )}
    </div>
  );
}

