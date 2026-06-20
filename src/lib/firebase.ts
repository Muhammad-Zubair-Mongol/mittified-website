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
const LOCAL_NAV_LINKS_KEY = "mittified_nav_links";
const LOCAL_ROTATING_KEYS_KEY = "mittified_rotating_keys";
const LOCAL_TICKER_ITEMS_KEY = "mittified_ticker_items";

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
  // Seeding default Live Drama Tracker items
  if (!localStorage.getItem(LOCAL_TICKER_ITEMS_KEY)) {
    localStorage.setItem(LOCAL_TICKER_ITEMS_KEY, JSON.stringify([
      "URGENT: Raza Samo drops 20-min tell-all podcast response.",
      "MILESTONE: Ducky Bhai officially crosses 8.4M subscribers.",
      "ALGORITHM WATCH: Cinematic vlogs face record low recommendation rates.",
      "TRENDING: #PakistaniYouTubeDrama tags dominate Twitter trends."
    ]));
  }
  // Seeding default dynamic navigation links
  if (!localStorage.getItem(LOCAL_NAV_LINKS_KEY)) {
    localStorage.setItem(LOCAL_NAV_LINKS_KEY, JSON.stringify([
      { label: "Home", href: "/" },
      { label: "Creator DB", href: "/creators" },
      { label: "Exposés", href: "/#news" },
      { label: "Analysis", href: "/#analysis" }
    ]));
  }
  // Seeding rotating API keys
  if (!localStorage.getItem(LOCAL_ROTATING_KEYS_KEY)) {
    localStorage.setItem(LOCAL_ROTATING_KEYS_KEY, JSON.stringify([]));
  }
}

// Whitelist Email Management Operations
export async function getWhitelistedAdminsFb(): Promise<string[]> {
  if (db) {
    try {
      const adminsCol = collection(db, "admins");
      const snap = await getDocs(adminsCol);
      const list = snap.docs.map(doc => doc.id.toLowerCase());
      if (list.length > 0) return list;
    } catch (e) {
      console.error("Firestore getWhitelistedAdmins error, falling back", e);
    }
  }
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(LOCAL_ADMINS_KEY) || "[]");
  }
  return ["mittifiedbusiness@gmail.com"];
}

export async function addWhitelistedAdminFb(email: string): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  if (db) {
    try {
      const adminDocRef = doc(db, "admins", cleanEmail);
      await setDoc(adminDocRef, { addedAt: new Date().toISOString() });
      return true;
    } catch (e) {
      console.error("Firestore addWhitelistedAdmin error", e);
    }
  }
  if (typeof window !== "undefined") {
    const list = await getWhitelistedAdminsFb();
    if (!list.includes(cleanEmail)) {
      list.push(cleanEmail);
      localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(list));
    }
    return true;
  }
  return false;
}

export async function removeWhitelistedAdminFb(email: string): Promise<boolean> {
  const cleanEmail = email.toLowerCase().trim();
  if (db) {
    try {
      const adminDocRef = doc(db, "admins", cleanEmail);
      // Using deleteDoc is standard, we import it if needed or set field if db active
      // For local fallback/transition, we can deleteDoc
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(adminDocRef);
      return true;
    } catch (e) {
      console.error("Firestore removeWhitelistedAdmin error", e);
    }
  }
  if (typeof window !== "undefined") {
    const list = await getWhitelistedAdminsFb();
    const updated = list.filter(e => e !== cleanEmail);
    localStorage.setItem(LOCAL_ADMINS_KEY, JSON.stringify(updated));
    return true;
  }
  return false;
}

// Check whitelist access: Returns true if user's email is in whitelisted database collection
export async function verifyAdminWhitelist(email: string | null): Promise<boolean> {
  if (!email) return false;

  const cleanEmail = email.toLowerCase().trim();
  // Master admin bypass rule
  if (cleanEmail === "mittifiedbusiness@gmail.com") {
    return true;
  }

  if (db) {
    try {
      const adminDocRef = doc(db, "admins", cleanEmail);
      const adminSnap = await getDoc(adminDocRef);
      return adminSnap.exists();
    } catch (e) {
      console.error("Firebase admin whitelist verification error:", e);
      return false;
    }
  }

  // Simulated fallback
  if (typeof window !== "undefined") {
    const whitelist = await getWhitelistedAdminsFb();
    return whitelist.includes(cleanEmail);
  }
  return false;
}

// Dynamic Navigation Link CRUD Operations
export interface NavLink {
  label: string;
  href: string;
}

export async function getNavLinksFb(): Promise<NavLink[]> {
  if (db) {
    try {
      const navCol = collection(db, "nav_links");
      const snap = await getDocs(navCol);
      const list = snap.docs.map(doc => doc.data() as NavLink);
      if (list.length > 0) return list;
    } catch (e) {
      console.error("Firestore getNavLinks error, falling back", e);
    }
  }
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(LOCAL_NAV_LINKS_KEY) || "[]");
  }
  return [
    { label: "Home", href: "/" },
    { label: "Creator DB", href: "/creators" },
    { label: "Exposés", href: "/#news" },
    { label: "Analysis", href: "/#analysis" }
  ];
}

export async function saveNavLinksFb(links: NavLink[]): Promise<boolean> {
  if (db) {
    try {
      // Clear and rewrite nav_links collection to keep order or write doc
      // For simplicity in client transition we write a config document or store in local storage
      const configDoc = doc(db, "site_config", "navigation");
      await setDoc(configDoc, { links });
    } catch (e) {
      console.error("Firestore saveNavLinks error", e);
    }
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_NAV_LINKS_KEY, JSON.stringify(links));
    return true;
  }
  return false;
}

// Rotating API Keys Operations
export async function getRotatingKeysFb(): Promise<string[]> {
  if (db) {
    try {
      const configDoc = doc(db, "site_config", "api_keys");
      const snap = await getDoc(configDoc);
      if (snap.exists()) {
        return snap.data().keys || [];
      }
    } catch (e) {
      console.error("Firestore getRotatingKeys error", e);
    }
  }
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(LOCAL_ROTATING_KEYS_KEY) || "[]");
  }
  return [];
}

export async function saveRotatingKeysFb(keys: string[]): Promise<boolean> {
  const cleanKeys = keys.map(k => k.trim()).filter(Boolean);
  if (db) {
    try {
      const configDoc = doc(db, "site_config", "api_keys");
      const snap = await getDoc(configDoc);
      const currentData = snap.exists() ? snap.data() : {};
      await setDoc(configDoc, { ...currentData, keys: cleanKeys });
    } catch (e) {
      console.error("Firestore saveRotatingKeys error", e);
    }
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_ROTATING_KEYS_KEY, JSON.stringify(cleanKeys));
    return true;
  }
  return false;
}

export async function getSelectedModelFb(): Promise<string> {
  if (db) {
    try {
      const configDoc = doc(db, "site_config", "api_keys");
      const snap = await getDoc(configDoc);
      if (snap.exists() && snap.data().model) {
        return snap.data().model;
      }
    } catch (e) {
      console.error("Firestore getSelectedModel error", e);
    }
  }
  if (typeof window !== "undefined") {
    return localStorage.getItem("mittified_selected_model") || "gemini-2.5-flash";
  }
  return "gemini-2.5-flash";
}

export async function saveSelectedModelFb(model: string): Promise<boolean> {
  const cleanModel = model.trim() || "gemini-2.5-flash";
  if (db) {
    try {
      const configDoc = doc(db, "site_config", "api_keys");
      const snap = await getDoc(configDoc);
      const currentData = snap.exists() ? snap.data() : {};
      await setDoc(configDoc, { ...currentData, model: cleanModel });
      return true;
    } catch (e) {
      console.error("Firestore saveSelectedModel error", e);
    }
  }
  if (typeof window !== "undefined") {
    localStorage.setItem("mittified_selected_model", cleanModel);
    return true;
  }
  return false;
}

export async function getNextActiveKeyFb(): Promise<string | null> {
  const keys = await getRotatingKeysFb();
  if (keys.length === 0) return null;
  
  // Rotate keys: move first key to the end
  const activeKey = keys[0];
  const rotated = [...keys.slice(1), activeKey];
  await saveRotatingKeysFb(rotated);
  
  return activeKey;
}

export async function getTickerItemsFb(): Promise<string[]> {
  if (db) {
    try {
      const configDoc = doc(db, "site_config", "ticker");
      const snap = await getDoc(configDoc);
      if (snap.exists()) {
        return snap.data().items || [];
      }
    } catch (e) {
      console.error("Firestore getTickerItems error", e);
    }
  }
  if (typeof window !== "undefined") {
    return JSON.parse(localStorage.getItem(LOCAL_TICKER_ITEMS_KEY) || "[]");
  }
  return [
    "URGENT: Raza Samo drops 20-min tell-all podcast response.",
    "MILESTONE: Ducky Bhai officially crosses 8.4M subscribers.",
    "ALGORITHM WATCH: Cinematic vlogs face record low recommendation rates.",
    "TRENDING: #PakistaniYouTubeDrama tags dominate Twitter trends."
  ];
}

export async function saveTickerItemsFb(items: string[]): Promise<boolean> {
  const cleanItems = items.map(i => i.trim()).filter(Boolean);
  if (db) {
    try {
      const configDoc = doc(db, "site_config", "ticker");
      await setDoc(configDoc, { items: cleanItems });
    } catch (e) {
      console.error("Firestore saveTickerItems error", e);
    }
  }
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_TICKER_ITEMS_KEY, JSON.stringify(cleanItems));
    return true;
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

export async function deleteArticleFb(id: string): Promise<boolean> {
  if (db) {
    try {
      const { deleteDoc } = await import("firebase/firestore");
      const articleDocRef = doc(db, "articles", id);
      await deleteDoc(articleDocRef);
      return true;
    } catch (e) {
      console.error("Firestore deleteArticle error", e);
    }
  }
  if (typeof window !== "undefined") {
    const articles = await getArticlesFb();
    const updated = articles.filter(a => a.id !== id);
    localStorage.setItem(LOCAL_ARTICLES_KEY, JSON.stringify(updated));
    return true;
  }
  return false;
}

export async function deleteCreatorFb(id: string): Promise<boolean> {
  if (db) {
    try {
      const { deleteDoc } = await import("firebase/firestore");
      const creatorDocRef = doc(db, "creators", id);
      await deleteDoc(creatorDocRef);
      return true;
    } catch (e) {
      console.error("Firestore deleteCreator error", e);
    }
  }
  if (typeof window !== "undefined") {
    const creators = await getCreatorsFb();
    const updated = creators.filter(c => c.id !== id);
    localStorage.setItem(LOCAL_CREATORS_KEY, JSON.stringify(updated));
    return true;
  }
  return false;
}

