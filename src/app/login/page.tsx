"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, googleProvider, verifyAdminWhitelist } from "@/lib/db";
import { signInWithPopup } from "firebase/auth";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleOAuthLogin = async () => {
    setLoading(true);
    setErrorMsg("");
    
    if (auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const email = result.user?.email;
        const isWhitelisted = await verifyAdminWhitelist(email);
        
        if (isWhitelisted) {
          setSuccessMsg("Admin Authorization Verified!");
          router.push("/admin");
        } else {
          setErrorMsg(`Unauthorized: ${email} is not whitelisted to write to this database.`);
          await auth.signOut();
          setLoading(false);
        }
      } catch (error: unknown) {
        setErrorMsg((error as { message?: string })?.message || "Failed to sign in via Google.");
        setLoading(false);
      }
    } else {
      // Simulate local login fallback (mock prompt selection)
      const mockEmail = window.prompt("Enter Google account email to simulate Google Sign-in:", "admin@mittified.studio");
      if (!mockEmail) {
        setLoading(false);
        return;
      }

      const isWhitelisted = await verifyAdminWhitelist(mockEmail);
      if (isWhitelisted) {
        localStorage.setItem(
          "mittified_session",
          JSON.stringify({ user: { email: mockEmail, role: "admin" } })
        );
        setSuccessMsg(`Simulated Admin Session Created for ${mockEmail}!`);
        router.push("/admin");
      } else {
        setErrorMsg(`Unauthorized: ${mockEmail} is not whitelisted to write to this database.`);
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FFD700]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white mb-8 mx-auto uppercase">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Home Page
        </Link>
        <span className="text-3xl font-black tracking-tighter text-white block text-center">
          MITTI<span className="text-[#FFD700]">FIED</span>
        </span>
        <h2 className="mt-4 text-center text-xl font-bold tracking-tight text-zinc-300 uppercase font-mono">
          Admin Portal Authentication
        </h2>
      </div>
 
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="glass-panel py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-zinc-800">
          
          <div className="mb-6 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-xs text-amber-400 leading-relaxed flex gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-bold">Security Constraint Notice</p>
              <p className="mt-0.5">Only whitelisted Google accounts are authorized for dashboard modifications.</p>
            </div>
          </div>
 
          {errorMsg && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-xs text-red-400">
              {errorMsg}
            </div>
          )}
 
          {successMsg && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg text-xs text-emerald-400">
              {successMsg}
            </div>
          )}
 
          <div className="space-y-4">
            <button
              onClick={handleOAuthLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-zinc-800 rounded-lg shadow-sm text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 focus:outline-none transition-all disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.85 2.99c.92-2.76 3.5-4.51 6.76-4.51z"/>
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.97 3.7-8.62z"/>
                <path fill="#FBBC05" d="M5.24 14.75c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31L1.39 7.14C.5 8.93 0 10.91 0 13s.5 4.07 1.39 5.86l3.85-3.11z"/>
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.1.74-2.52 1.18-4.23 1.18-3.26 0-5.84-1.75-6.76-4.51L1.39 16.9C3.37 20.78 7.35 23 12 23z"/>
              </svg>
              {loading ? "Authenticating session..." : "Continue with Google"}
            </button>

            {!auth && (
              <p className="text-[10px] text-zinc-500 font-mono text-center">
                Firebase keys missing. Simulating administrator OAuth bypass context.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
