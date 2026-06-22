import React from "react";
import type { Metadata } from "next";
import { BASE_URL } from "@/lib/config";
import { getCreators } from "@/lib/db";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CreatorDatabase from "@/components/CreatorDatabase";
import AdsenseContainer from "@/components/AdsenseContainer";

const title = "Pakistani YouTube Creator Database | Mittified Media";
const description = "Browse the complete directory of Pakistani YouTube creators, active status, total reach metrics, monthly viewership trends, and drama meters.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${BASE_URL}/creators`,
  },
  openGraph: {
    title,
    description,
    url: `${BASE_URL}/creators`,
    siteName: "Mittified Media",
    images: [
      {
        url: `${BASE_URL}/logo.png`,
        width: 144,
        height: 144,
        alt: "Mittified Media Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${BASE_URL}/logo.png`],
  },
};

export const revalidate = 900; // ISR revalidation

export default async function CreatorsPage() {
  const creators = await getCreators();
  const totalSubscribers = creators.reduce((acc, c) => acc + c.subscribers, 0);
  const exposedCount = creators.filter(c => c.status === "Drama/Exposed").length;

  return (
    <>
      <Header totalSubscribers={totalSubscribers} exposedCount={exposedCount} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdsenseContainer placement="header" adSlot="99283741" />
        <div className="py-6">
          <CreatorDatabase />
        </div>
      </main>
      <Footer />
    </>
  );
}
