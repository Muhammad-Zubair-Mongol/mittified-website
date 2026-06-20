import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, User as FirebaseUser } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, updateDoc, addDoc, query, orderBy } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initialCreators, initialArticles, Creator, Article } from "./mockData";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if actual credentials exist
const isFirebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

const app = isFirebaseConfigured 
  ? (getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null;

export const auth = app ? getAuth(app) : null;
export const googleProvider = app ? new GoogleAuthProvider() : null;
export const db = app ? getFirestore(app) : null;
export const storage = app ? getStorage(app) : null;

import { uploadImageToR2 } from "./r2";

// Upload helper for admin media (Cloudflare R2 storage)
export async function uploadImage(file: File, folder: string): Promise<string | null> {
  return uploadImageToR2(file, folder);
}

// Simulated fallback operations using localStorage
const LOCAL_CREATORS_KEY = "mittified_creators_fb";
const LOCAL_ARTICLES_KEY = "mittified_articles_fb";
const LOCAL_ADMINS_KEY = "mittified_admins_fb";

if (typeof window !== "undefined") {
  if (!localStorage.getItem(LOCAL_CREATORS_KEY)) {
    localStorage.setItem(LOCAL_CREATORS_KEY, JSON.stringify(initialCreators));
  }
  if (!localStorage.getItem(LOCAL_ARTICLES_KEY)) {
    localStorage.setItem(LOCAL_ARTICLES_KEY, JSON.stringify(initialArticles));
  }
  // Seeding simulated admin whitelist
  if (!localStorage.getItem(LOCAL_ADMINS_KEY)) {
    localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify([
      "admin@mittified.media",
      "mitti@mittified.media",
      "mittifiedbusiness@gmail.com"
    ]));
  }
}

// Check whitelist access: Returns true if user's email is in whitelisted database collection
export async function verifyAdminWhitelist(email: string | null): Promise<boolean> {
  if (!email) return false;

  // Master admin bypass rule
  if (email.toLowerCase() === "mittifiedbusiness@gmail.com") {
    return true;
  }

  if (db) {
    try {
      const adminDocRef = doc(db, "admins", email);
      const adminSnap = await getDoc(adminDocRef);
      return adminSnap.exists();
    } catch (e) {
      console.error("Firebase admin whitelist verification error:", e);
      return false;
    }
  }

  // Simulated fallback
  if (typeof window !== "undefined") {
    const whitelist: string[] = JSON.parse(localStorage.getItem(LOCAL_ADMINS_KEY) || "[]");
    return whitelist.includes(email.toLowerCase());
  }
  return false;
}

// DATA OPERATIONS GET / SET
export async function getCreatorsFb(): Promise<Creator[]> {
  if (db) {
    try {
      const creatorsCol = collection(db, "creators");
      const creatorSnapshot = await getDocs(creatorsCol);
      const creatorsList = creatorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Creator));
      if (creatorsList.length > 0) {
        return creatorsList.sort((a, b) => b.subscribers - a.subscribers);
      }
    } catch (e) {
      console.error("Firestore getCreators error, falling back", e);
    }
  }

  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(LOCAL_CREATORS_KEY) || "[]");
  }
  return initialCreators;
}

export async function getArticlesFb(): Promise<Article[]> {
  if (db) {
    try {
      const articlesCol = collection(db, "articles");
      const q = query(articlesCol, orderBy("publishedAt", "desc"));
      const articleSnapshot = await getDocs(q);
      const articlesList = articleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
      if (articlesList.length > 0) return articlesList;
    } catch (e) {
      console.error("Firestore getArticles error, falling back", e);
    }
  }

  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(LOCAL_ARTICLES_KEY) || "[]");
  }
  return initialArticles;
}

export async function getArticleBySlugFb(slug: string): Promise<Article | null> {
  const articles = await getArticlesFb();
  return articles.find(a => a.slug === slug) || null;
}

export async function updateCreatorDramaMeterFb(id: string, dramaMeter: number): Promise<boolean> {
  if (db) {
    try {
      const creatorDocRef = doc(db, "creators", id);
      await updateDoc(creatorDocRef, { dramaMeter });
      return true;
    } catch (e) {
      console.error("Firestore updateCreatorDramaMeter error", e);
    }
  }

  if (typeof window !== "undefined") {
    const creators = await getCreatorsFb();
    const updated = creators.map(c => c.id === id ? { ...c, dramaMeter } : c);
    localStorage.setItem(LOCAL_CREATORS_KEY, JSON.stringify(updated));
    return true;
  }
  return false;
}

export async function addArticleFb(article: Omit<Article, "id" | "publishedAt">): Promise<Article | null> {
  const newArticle: Article = {
    ...article,
    id: `art-${Date.now()}`,
    publishedAt: new Date().toISOString(),
  };

  if (db) {
    try {
      const articlesCol = collection(db, "articles");
      const docRef = await addDoc(articlesCol, newArticle);
      return { ...newArticle, id: docRef.id };
    } catch (e) {
      console.error("Firestore addArticle error", e);
    }
  }

  if (typeof window !== "undefined") {
    const articles = await getArticlesFb();
    const updated = [newArticle, ...articles];
    localStorage.setItem(LOCAL_ARTICLES_KEY, JSON.stringify(updated));
    return newArticle;
  }
  return newArticle;
}

export async function addCreatorFb(creator: Omit<Creator, "id">): Promise<Creator | null> {
  const newCreator: Creator = {
    ...creator,
    id: `creator-${Date.now()}`,
  };

  if (db) {
    try {
      const creatorsCol = collection(db, "creators");
      const docRef = await addDoc(creatorsCol, newCreator);
      return { ...newCreator, id: docRef.id };
    } catch (e) {
      console.error("Firestore addCreator error", e);
    }
  }

  if (typeof window !== "undefined") {
    const creators = await getCreatorsFb();
    const updated = [...creators, newCreator];
    localStorage.setItem(LOCAL_CREATORS_KEY, JSON.stringify(updated));
    return newCreator;
  }
  return newCreator;
}
