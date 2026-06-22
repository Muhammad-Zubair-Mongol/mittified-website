import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { BASE_URL } from "@/lib/config";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mittified Media - Pakistani YouTube Tracker & Exposés",
  description: "The premier independent news source tracking the Pakistani YouTube ecosystem. Uncovering drama, tracking statistics, and archiving creators.",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    siteName: "Mittified Media",
    type: "website",
    images: [
      {
        url: `${BASE_URL}/logo.png`,
        width: 144,
        height: 144,
      },
    ],
  },
  twitter: {
    card: "summary",
    site: "@mittified",
    images: [`${BASE_URL}/logo.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Google Analytics Dynamic Loading */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}

