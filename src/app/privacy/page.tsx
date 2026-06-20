import React from "react";
import Link from "next/link";
import { getCreators } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowLeft, Shield } from "lucide-react";

export const revalidate = 900; // 15 mins page revalidation (ISR)

export default async function PrivacyPolicyPage() {
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
            <Shield className="text-[#FFD700] w-8 h-8" />
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">Privacy Policy</h1>
          </div>

          <p className="text-xs text-zinc-500 font-mono mb-8 border-b border-zinc-900 pb-4">
            Last Updated: June 20, 2026
          </p>

          <div className="prose prose-invert max-w-none text-zinc-300 leading-relaxed space-y-6 text-sm md:text-base">
            <p>
              At <strong>Mittified Media Hub</strong>, accessible from https://mittified.media, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Mittified Media Hub and how we use it.
            </p>

            <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono mt-8 border-l-2 border-[#FFD700] pl-3">
              1. Information We Collect
            </h2>
            <p>
              We collect information in several ways when you visit our website:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Log Files:</strong> Mittified Media Hub follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.
              </li>
              <li>
                <strong>Cookies and Web Beacons:</strong> Like any other website, we use &apos;cookies&apos; to store information including visitors&apos; preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users&apos; experience by customizing our web page content based on visitors&apos; browser type and/or other information.
              </li>
            </ul>

            <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono mt-8 border-l-2 border-[#FFD700] pl-3">
              2. Google DoubleClick DART Cookie
            </h2>
            <p>
              Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.website.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-[#FFD700] hover:underline">https://policies.google.com/technologies/ads</a>.
            </p>

            <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono mt-8 border-l-2 border-[#FFD700] pl-3">
              3. Advertising Partners Privacy Policies
            </h2>
            <p>
              Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on Mittified Media Hub, which are sent directly to users&apos; browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
            </p>
            <p className="italic text-zinc-400">
              Note that Mittified Media Hub has no access to or control over these cookies that are used by third-party advertisers.
            </p>

            <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono mt-8 border-l-2 border-[#FFD700] pl-3">
              4. Analytics and Third Party Tracking
            </h2>
            <p>
              We use analytics services (such as Google Analytics) to monitor and analyze the use of our Service. These services track engagement rates, click paths, and traffic metrics to help us optimize our coverage of the Pakistani YouTube ecosystem.
            </p>

            <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono mt-8 border-l-2 border-[#FFD700] pl-3">
              5. Consent
            </h2>
            <p>
              By using our website, you hereby consent to our Privacy Policy and agree to its terms.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
