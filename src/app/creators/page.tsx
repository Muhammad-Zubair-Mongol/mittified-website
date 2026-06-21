import React from "react";
import { getCreators } from "@/lib/db";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CreatorDatabase from "@/components/CreatorDatabase";
import AdsenseContainer from "@/components/AdsenseContainer";

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
