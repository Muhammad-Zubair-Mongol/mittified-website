import { auth } from "./db";

export async function uploadImageToR2(file: File, folder: string): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const headers: Record<string, string> = {};
    if (auth && auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Upload API returned status: ${response.status}`);
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Cloudflare R2 upload failed:", error);
    return null;
  }
}
