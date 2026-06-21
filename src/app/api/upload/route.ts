import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || "",
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
  },
});



export async function POST(req: NextRequest) {
  try {
    const { adminAuth, adminDb } = await import("@/lib/firebase-admin");
    // Verify Firebase Admin ID Token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
    }
    const token = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (err) {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    if (!decodedToken.email) {
      return NextResponse.json({ error: "Forbidden: Missing email" }, { status: 403 });
    }

    const cleanEmail = decodedToken.email.toLowerCase().trim();
    const isMaster = cleanEmail === "mittifiedbusiness@gmail.com" || cleanEmail === "mittifiedbusiness@gamail.com";
    const docSnap = await adminDb.collection("admins").doc(cleanEmail).get();

    if (!isMaster && !docSnap.exists) {
      return NextResponse.json({ error: "Forbidden: Not an authorized admin" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string || "covers";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileKey = `${folder}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || "";

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileKey}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error("R2 Upload Route Error:", error);
    return NextResponse.json({ error: errMessage || "Upload failed" }, { status: 500 });
  }
}
