import { NextResponse } from "next/server";

export async function GET() {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "pub-6103128825487169";
  const adsContent = `# Mittified Media AdSense Configuration
google.com, ${publisherId}, DIRECT, f08c47fec0942fa0
`;

  return new NextResponse(adsContent, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
