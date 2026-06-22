import React from "react";
import type { Metadata } from "next";
import { BASE_URL } from "@/lib/config";
import Link from "next/link";
import { getCreators } from "@/lib/db";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Use | Mittified Media",
  description: "Read the Terms of Use for Mittified Media Hub, specifying the terms governing the creator database access, informational boundaries, and disclaimer of liability.",
  alternates: {
    canonical: `${BASE_URL}/terms`,
  },
};

export const revalidate = 900; // 15 mins page revalidation (ISR)

export default async function TermsPage() {
  const creators = await getCreators();
  const totalSubscribers = creators.reduce((acc, c) => acc + c.subscribers, 0);
  const exposedCount = creators.filter((c) => c.status === "Drama/Exposed").length;

  return (
    <>
      <Header totalSubscribers={totalSubscribers} exposedCount={exposedCount} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white mb-8 uppercase"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="glass-panel p-8 md:p-10 rounded-2xl border border-zinc-800 shadow-2xl bg-zinc-950/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700]/5 blur-[80px] pointer-events-none rounded-full" />
          
          <div className="flex items-center gap-3 mb-6">
            <Scale className="text-[#FFD700] w-8 h-8" />
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">Terms of Use</h1>
          </div>

          <p className="text-xs text-zinc-500 font-mono mb-8 border-b border-zinc-900 pb-4">
            Last Updated: June 20, 2026
          </p>

          <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed space-y-6 text-sm md:text-base">
            <p>
              Welcome to <strong>Mittified Media Hub</strong>. These terms and conditions outline the rules and regulations for the use of Mittified Media Hub&apos;s Website, located at https://mittified.studio.
            </p>

            <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono mt-8 border-l-2 border-[#FFD700] pl-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing this website we assume you accept these terms and conditions. Do not continue to use Mittified Media Hub if you do not agree to take all of the terms and conditions stated on this page.
            </p>

            <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono mt-8 border-l-2 border-[#FFD700] pl-3">
              2. Nature of Service (Creator Database & Reports)
            </h2>
            <p>
              Mittified Media Hub compiles publicly available metrics, drama heat indices, social media statistics, and news summaries regarding Pakistani content creators.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Information Purposes:</strong> All database indexes (including the &quot;Drama Index&quot;) and report contents are compiled for entertainment, informational, and archival purposes.
              </li>
              <li>
                <strong>Accuracy:</strong> While we endeavor to keep metrics updated, statistics change rapidly on third-party platform servers. We make no representations or warranties of any kind regarding completeness, accuracy, or suitability.
              </li>
            </ul>

            <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono mt-8 border-l-2 border-[#FFD700] pl-3">
              3. User Conduct
            </h2>
            <p>
              You agree not to use the website to:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Harvest or scrape data from our creator list using automated crawlers without prior written authorization.
              </li>
              <li>
                Attempt to bypass the administrative whitelist authentication systems.
              </li>
              <li>
                Engage in harassment or hate speech in external discussions referencing our database indexes.
              </li>
            </ul>

            <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono mt-8 border-l-2 border-[#FFD700] pl-3">
              4. Intellectual Property
            </h2>
            <p>
              Unless otherwise stated, Mittified Media Hub and/or its licensors own the intellectual property rights for all material on Mittified Media Hub. All intellectual property rights are reserved. You may access this from Mittified Media Hub for your own personal use subjected to restrictions set in these terms and conditions.
            </p>

            <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono mt-8 border-l-2 border-[#FFD700] pl-3">
              5. Disclaimer of Liability
            </h2>
            <p>
              In no event shall Mittified Media Hub, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this Website whether such liability is under contract. Mittified Media Hub shall not be held liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this Website.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
